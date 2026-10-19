"""Suivi des déplacements — petite fenêtre qui s'ouvre au démarrage du PC.

- Mode « Villes » : un bouton par ville. Un clic inscrit la ville à la date
  du jour (et seulement aujourd'hui). Un second clic sur la même ville
  l'enlève d'aujourd'hui, en cas d'erreur.
- Mode « Calendrier » : grand calendrier du mois avec les villes de chaque
  jour, flèches pour naviguer (consultation uniquement) et vue « tous les
  mois » pour choisir un mois.
- La fenêtre se déplace par sa barre de titre et peut être verrouillée.

Les données sont dans %APPDATA%\\SuiviDeplacements (data.json, config.json).
"""

import calendar
import datetime as dt
import json
import os
import socket
import sys
import tkinter as tk

APP_NAME = "SuiviDeplacements"
APP_TITLE = "Suivi des déplacements"

# Ville -> couleur dans le calendrier
CITIES = [
    ("Maison", "#6b7280"),
    ("Marseille", "#2563eb"),
    ("Nimes", "#dc2626"),
    ("Beziers", "#ea580c"),
    ("MTP", "#7c3aed"),
    ("Tavel", "#be185d"),
    ("Avignon", "#0d9488"),
    ("Chateaux", "#a16207"),
    ("Bollene", "#16a34a"),
]
CITY_COLORS = dict(CITIES)

DAY_HEADERS = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"]
DAY_NAMES = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
MONTH_NAMES = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",
               "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

CITIES_SIZE = (470, 340)
CALENDAR_SIZE = (1100, 780)

FONT = "Segoe UI" if sys.platform == "win32" else "DejaVu Sans"
BG = "#ffffff"
TITLE_BG = "#111827"
TITLE_FG = "#f9fafb"
GRID = "#111111"
MUTED = "#c7c7c7"
TODAY_BG = "#fff7d6"

SINGLE_INSTANCE_PORT = 47653


def data_dir():
    base = os.environ.get("APPDATA") or os.path.join(os.path.expanduser("~"), ".config")
    path = os.path.join(base, APP_NAME)
    os.makedirs(path, exist_ok=True)
    return path


class Store:
    """Déplacements enregistrés : {"AAAA-MM-JJ": ["Ville", ...]}."""

    def __init__(self, path):
        self.path = path
        self.trips = load_json(path, {})

    def cities_on(self, day):
        return self.trips.get(day.isoformat(), [])

    def toggle_today(self, city):
        key = dt.date.today().isoformat()
        cities = self.trips.setdefault(key, [])
        if city in cities:
            cities.remove(city)
        else:
            cities.append(city)
        if not cities:
            del self.trips[key]
        save_json(self.path, self.trips)


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def save_json(path, value):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(value, f, ensure_ascii=False, indent=2, sort_keys=True)
    os.replace(tmp, path)


def register_startup():
    """Ajoute l'application au démarrage de Windows (clé Run de l'utilisateur)."""
    if sys.platform != "win32":
        return
    try:
        import winreg
        if getattr(sys, "frozen", False):
            command = f'"{sys.executable}"'
        else:
            exe = sys.executable
            pythonw = os.path.join(os.path.dirname(exe), "pythonw.exe")
            if os.path.exists(pythonw):
                exe = pythonw
            command = f'"{exe}" "{os.path.abspath(__file__)}"'
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                             r"Software\Microsoft\Windows\CurrentVersion\Run",
                             0, winreg.KEY_SET_VALUE)
        winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, command)
        winreg.CloseKey(key)
    except OSError:
        pass


def virtual_screen(root):
    """(x, y, largeur, hauteur) de l'ensemble des écrans."""
    if sys.platform == "win32":
        try:
            import ctypes
            m = ctypes.windll.user32.GetSystemMetrics
            return m(76), m(77), m(78), m(79)
        except Exception:
            pass
    return 0, 0, root.winfo_screenwidth(), root.winfo_screenheight()


class App:
    def __init__(self, root):
        self.root = root
        folder = data_dir()
        self.store = Store(os.path.join(folder, "data.json"))
        self.config_path = os.path.join(folder, "config.json")
        self.config = load_json(self.config_path, {})

        self.mode = "cities"
        self.view = "month"  # "month" ou "year" dans le mode calendrier
        today = dt.date.today()
        self.shown_year, self.shown_month = today.year, today.month
        self.today = today
        self.drag_offset = None

        root.title(APP_TITLE)
        root.configure(bg=GRID)
        root.overrideredirect(True)
        root.attributes("-topmost", False)

        self.build_title_bar()
        self.body = tk.Frame(root, bg=BG)
        self.body.pack(fill="both", expand=True, padx=1, pady=(0, 1))

        self.place_window()
        self.render()
        if sys.platform == "win32":
            root.after(10, self.show_in_taskbar)
        root.bind("<Map>", self.on_map)
        root.after(60_000, self.watch_date)

    # ---------- fenêtre ----------

    def build_title_bar(self):
        bar = tk.Frame(self.root, bg=TITLE_BG, height=34)
        bar.pack(fill="x", padx=1, pady=(1, 0))
        def bar_button(text, command, hover="#374151"):
            b = tk.Label(bar, text=text, bg=TITLE_BG, fg=TITLE_FG, font=(FONT, 11),
                         width=4, cursor="hand2")
            b.pack(side="right", fill="y")
            b.bind("<Button-1>", lambda e: command())
            b.bind("<Enter>", lambda e: b.configure(bg=hover))
            b.bind("<Leave>", lambda e: b.configure(bg=TITLE_BG))
            return b

        bar_button("✕", self.root.destroy, hover="#b91c1c")
        bar_button("—", self.minimize)
        self.lock_button = bar_button("", self.toggle_lock)
        self.lock_button.configure(width=8, font=(FONT, 9, "bold"))
        self.switch_button = tk.Label(bar, bg="#2563eb", fg="white", font=(FONT, 10, "bold"),
                                      padx=12, cursor="hand2")
        self.switch_button.pack(side="right", fill="y", padx=(0, 6))
        self.switch_button.bind("<Button-1>", lambda e: self.switch_mode())
        # Le titre est placé en dernier pour qu'il ne prenne que la place restante.
        self.title_label = tk.Label(bar, text="  Déplacements", bg=TITLE_BG, fg=TITLE_FG,
                                    font=(FONT, 10, "bold"), anchor="w")
        self.title_label.pack(side="left", fill="x", expand=True, ipady=6)
        self.update_lock_button()

        for w in (bar, self.title_label):
            w.bind("<ButtonPress-1>", self.start_drag)
            w.bind("<B1-Motion>", self.drag)
            w.bind("<ButtonRelease-1>", self.end_drag)

    def show_in_taskbar(self):
        # Une fenêtre sans bordure n'apparaît pas dans la barre des tâches par défaut.
        try:
            import ctypes
            GWL_EXSTYLE, WS_EX_APPWINDOW, WS_EX_TOOLWINDOW = -20, 0x40000, 0x80
            hwnd = ctypes.windll.user32.GetParent(self.root.winfo_id())
            style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_EXSTYLE)
            style = (style & ~WS_EX_TOOLWINDOW) | WS_EX_APPWINDOW
            ctypes.windll.user32.SetWindowLongW(hwnd, GWL_EXSTYLE, style)
            self.root.withdraw()
            self.root.after(10, self.root.deiconify)
        except Exception:
            pass

    def minimize(self):
        self.root.overrideredirect(False)
        self.root.iconify()

    def on_map(self, event):
        if event.widget is self.root and not self.root.overrideredirect():
            self.root.overrideredirect(True)
            if sys.platform == "win32":
                self.root.after(10, self.show_in_taskbar)

    def place_window(self):
        w, h = self.size()
        vx, vy, vw, vh = virtual_screen(self.root)
        x = self.config.get("x")
        y = self.config.get("y")
        # Position par défaut, ou si l'écran mémorisé n'est plus branché.
        if (not isinstance(x, int) or not isinstance(y, int)
                or not (vx <= x <= vx + vw - 80 and vy <= y <= vy + vh - 40)):
            x = (self.root.winfo_screenwidth() - w) // 2
            y = (self.root.winfo_screenheight() - h) // 3
        self.root.geometry(f"{w}x{h}+{x}+{y}")

    def resize_in_screen(self):
        # Garde la fenêtre agrandie entièrement visible.
        w, h = self.size()
        vx, vy, vw, vh = virtual_screen(self.root)
        x = max(vx, min(self.root.winfo_x(), vx + vw - w))
        y = max(vy, min(self.root.winfo_y(), vy + vh - h))
        self.root.geometry(f"{w}x{h}+{x}+{y}")

    def size(self):
        return CALENDAR_SIZE if self.mode == "calendar" else CITIES_SIZE

    def save_config(self):
        save_json(self.config_path, self.config)

    def toggle_lock(self):
        self.config["locked"] = not self.config.get("locked", False)
        self.save_config()
        self.update_lock_button()

    def update_lock_button(self):
        locked = self.config.get("locked", False)
        self.lock_button.configure(text="Bloquée" if locked else "Bloquer",
                                   fg="#fbbf24" if locked else TITLE_FG)
        self.title_label.configure(cursor="arrow" if locked else "fleur")

    def start_drag(self, event):
        if self.config.get("locked", False):
            self.drag_offset = None
            return
        self.drag_offset = (event.x_root - self.root.winfo_x(),
                            event.y_root - self.root.winfo_y())

    def drag(self, event):
        if self.drag_offset:
            x = event.x_root - self.drag_offset[0]
            y = event.y_root - self.drag_offset[1]
            self.root.geometry(f"+{x}+{y}")

    def end_drag(self, event):
        if self.drag_offset:
            self.drag_offset = None
            self.config["x"] = self.root.winfo_x()
            self.config["y"] = self.root.winfo_y()
            self.save_config()

    def switch_mode(self):
        self.mode = "calendar" if self.mode == "cities" else "cities"
        if self.mode == "calendar":
            today = dt.date.today()
            self.view = "month"
            self.shown_year, self.shown_month = today.year, today.month
        self.resize_in_screen()
        self.render()

    def watch_date(self):
        # Si le PC reste allumé après minuit, on passe au nouveau jour.
        if dt.date.today() != self.today:
            self.today = dt.date.today()
            self.render()
        self.root.after(60_000, self.watch_date)

    # ---------- affichage ----------

    def render(self):
        for child in self.body.winfo_children():
            child.destroy()
        if self.mode == "cities":
            self.switch_button.configure(text="Calendrier")
            self.render_cities()
        else:
            self.switch_button.configure(text="Villes")
            if self.view == "year":
                self.render_year()
            else:
                self.render_month()

    def render_cities(self):
        today = dt.date.today()
        done = self.store.cities_on(today)
        header = f"Aujourd'hui : {DAY_NAMES[today.weekday()]} {today.day} " \
                 f"{MONTH_NAMES[today.month - 1].lower()} {today.year}"
        tk.Label(self.body, text=header, bg=BG, fg="#111827",
                 font=(FONT, 11, "bold")).pack(pady=(12, 2))
        tk.Label(self.body, text="Clique sur une ville pour l'ajouter (re-clique pour l'enlever)",
                 bg=BG, fg="#6b7280", font=(FONT, 8)).pack(pady=(0, 8))

        grid = tk.Frame(self.body, bg=BG)
        grid.pack(fill="both", expand=True, padx=12, pady=(0, 12))
        for i, (city, color) in enumerate(CITIES):
            selected = city in done
            b = tk.Button(grid, text=("✓ " if selected else "") + city,
                          font=(FONT, 11, "bold"), relief="flat", cursor="hand2",
                          bg=color if selected else "#f3f4f6",
                          fg="white" if selected else "#111827",
                          activebackground=color, activeforeground="white",
                          command=lambda c=city: self.on_city(c))
            b.grid(row=i // 3, column=i % 3, sticky="nsew", padx=4, pady=4)
        for c in range(3):
            grid.columnconfigure(c, weight=1, uniform="c")
        for r in range((len(CITIES) + 2) // 3):
            grid.rowconfigure(r, weight=1, uniform="r")

    def on_city(self, city):
        self.store.toggle_today(city)
        self.render()

    def nav_bar(self, title, prev_cmd, next_cmd, extra_text, extra_cmd):
        bar = tk.Frame(self.body, bg=BG)
        bar.pack(fill="x", padx=16, pady=(10, 6))

        def nav(text, cmd, side):
            b = tk.Button(bar, text=text, command=cmd, font=(FONT, 12, "bold"), relief="flat",
                          bg="#f3f4f6", activebackground="#e5e7eb", cursor="hand2", width=3)
            b.pack(side=side)
            return b

        nav("◀", prev_cmd, "left")
        tk.Label(bar, text=title, bg=BG, fg="#111827",
                 font=(FONT, 16, "bold"), width=18).pack(side="left", padx=8)
        nav("▶", next_cmd, "left")
        tk.Button(bar, text=extra_text, command=extra_cmd, font=(FONT, 10, "bold"),
                  relief="flat", bg="#111827", fg="white", activebackground="#374151",
                  activeforeground="white", cursor="hand2", padx=12).pack(side="right")
        tk.Button(bar, text="Aujourd'hui", command=self.go_today, font=(FONT, 10),
                  relief="flat", bg="#f3f4f6", activebackground="#e5e7eb",
                  cursor="hand2", padx=10).pack(side="right", padx=8)

    def go_today(self):
        today = dt.date.today()
        self.view = "month"
        self.shown_year, self.shown_month = today.year, today.month
        self.render()

    def shift_month(self, delta):
        index = self.shown_year * 12 + (self.shown_month - 1) + delta
        self.shown_year, self.shown_month = divmod(index, 12)
        self.shown_month += 1
        self.render()

    def shift_year(self, delta):
        self.shown_year += delta
        self.render()

    def open_month(self, month):
        self.view = "month"
        self.shown_month = month
        self.render()

    def show_year(self):
        self.view = "year"
        self.render()

    def render_month(self):
        year, month = self.shown_year, self.shown_month
        self.nav_bar(f"{MONTH_NAMES[month - 1]} {year}",
                     lambda: self.shift_month(-1), lambda: self.shift_month(1),
                     "Voir tous les mois", self.show_year)

        weeks = calendar.Calendar(firstweekday=6).monthdatescalendar(year, month)
        today = dt.date.today()

        grid = tk.Frame(self.body, bg=BG)
        grid.pack(fill="both", expand=True, padx=16, pady=(0, 16))
        for col, name in enumerate(DAY_HEADERS):
            tk.Label(grid, text=name, bg=BG, fg="#111111",
                     font=(FONT, 13, "bold")).grid(row=0, column=col, pady=(0, 6))
            grid.columnconfigure(col, weight=1, uniform="col")

        for r, week in enumerate(weeks, start=1):
            grid.rowconfigure(r, weight=1, uniform="row")
            for col, day in enumerate(week):
                in_month = day.month == month
                bg = TODAY_BG if day == today else BG
                cell = tk.Frame(grid, bg=bg, highlightbackground=GRID,
                                highlightthickness=1)
                cell.grid(row=r, column=col, sticky="nsew", padx=0, pady=0)
                cell.grid_propagate(False)
                cell.pack_propagate(False)
                tk.Label(cell, text=str(day.day), bg=bg,
                         fg="#111111" if in_month else MUTED,
                         font=(FONT, 12, "bold")).pack(anchor="nw", padx=8, pady=(4, 2))
                if not in_month:
                    continue
                for city in self.store.cities_on(day):
                    tk.Label(cell, text=city, bg=CITY_COLORS.get(city, "#6b7280"),
                             fg="white", font=(FONT, 9, "bold"), anchor="w",
                             padx=6).pack(fill="x", padx=6, pady=1)

    def render_year(self):
        year = self.shown_year
        self.nav_bar(str(year), lambda: self.shift_year(-1), lambda: self.shift_year(1),
                     "Retour au mois", lambda: self.open_month(self.shown_month))
        tk.Label(self.body, text="Clique sur un mois pour l'afficher en grand",
                 bg=BG, fg="#6b7280", font=(FONT, 9)).pack()

        grid = tk.Frame(self.body, bg=BG)
        grid.pack(fill="both", expand=True, padx=16, pady=(4, 16))
        today = dt.date.today()
        cal = calendar.Calendar(firstweekday=6)
        for m in range(1, 13):
            r, c = divmod(m - 1, 4)
            grid.columnconfigure(c, weight=1, uniform="mc")
            grid.rowconfigure(r, weight=1, uniform="mr")
            box = tk.Frame(grid, bg=BG, highlightbackground="#d1d5db",
                           highlightthickness=1, cursor="hand2")
            box.grid(row=r, column=c, sticky="nsew", padx=6, pady=6)

            trips = sum(1 for d in cal.itermonthdates(year, m)
                        if d.month == m and self.store.cities_on(d))
            current = (year, m) == (today.year, today.month)
            tk.Label(box, text=MONTH_NAMES[m - 1], bg=BG,
                     fg="#2563eb" if current else "#111827",
                     font=(FONT, 11, "bold")).pack(pady=(6, 0))
            tk.Label(box, text=f"{trips} jour(s) avec déplacement" if trips else "—",
                     bg=BG, fg="#6b7280", font=(FONT, 8)).pack()

            mini = tk.Frame(box, bg=BG)
            mini.pack(padx=8, pady=(2, 6))
            for col, name in enumerate(DAY_HEADERS):
                tk.Label(mini, text=name[0], bg=BG, fg="#9ca3af",
                         font=(FONT, 7, "bold"), width=3).grid(row=0, column=col)
            for wr, week in enumerate(cal.monthdatescalendar(year, m), start=1):
                for col, day in enumerate(week):
                    if day.month != m:
                        continue
                    cities = self.store.cities_on(day)
                    if cities:
                        bg, fg = CITY_COLORS.get(cities[0], "#6b7280"), "white"
                    elif day == today:
                        bg, fg = TODAY_BG, "#111111"
                    else:
                        bg, fg = BG, "#374151"
                    tk.Label(mini, text=str(day.day), bg=bg, fg=fg,
                             font=(FONT, 7), width=3).grid(row=wr, column=col)

            bind_click(box, lambda e, month=m: self.open_month(month))


def bind_click(widget, handler):
    widget.bind("<Button-1>", handler)
    for child in widget.winfo_children():
        bind_click(child, handler)


def already_running():
    # Empêche d'ouvrir deux fenêtres si le programme est lancé deux fois.
    global _instance_lock
    _instance_lock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        _instance_lock.bind(("127.0.0.1", SINGLE_INSTANCE_PORT))
        return False
    except OSError:
        return True


def main():
    if already_running():
        return
    register_startup()
    root = tk.Tk()
    App(root)
    root.mainloop()


if __name__ == "__main__":
    main()

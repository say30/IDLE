--[[
	__BRAND__ — plugin Roblox Studio

	Ce plugin relie Studio à ton projet sur le site :
	  1. Sur le site, ouvre ton projet et clique sur « Connecter Studio » : un code s'affiche.
	  2. Dans Studio, clique sur le bouton __BRAND__ (onglet Plugins), tape le code, valide.
	  3. Chaque fois que l'IA modifie ton jeu sur le site, les scripts arrivent ici tout seuls.

	Sécurité : le plugin ne parle qu'à __SITE_URL__. Il ne crée, modifie ou supprime
	que les scripts qu'il a lui-même créés (marqués avec l'attribut "__BRAND__").
	Chaque synchronisation peut être annulée avec Ctrl+Z.
]]

local HttpService = game:GetService("HttpService")
local ChangeHistoryService = game:GetService("ChangeHistoryService")
local RunService = game:GetService("RunService")
local ScriptEditorService = game:GetService("ScriptEditorService")

local SITE_URL = "__SITE_URL__"
local BRAND = "__BRAND__"
local MARK = BRAND -- attribut posé sur les scripts gérés par le plugin
local TOKEN_KEY = BRAND .. "_token_" .. game.PlaceId
local POLL_SECONDS = 2

local ALLOWED_ROOTS = {
	ServerScriptService = true,
	ServerStorage = true,
	ReplicatedStorage = true,
	ReplicatedFirst = true,
	StarterGui = true,
	StarterPack = true,
	StarterPlayer = true,
	Workspace = true,
}
local SCRIPT_CLASSES = { Script = true, LocalScript = true, ModuleScript = true }

-- ============ Interface ============
local toolbar = plugin:CreateToolbar(BRAND)
local toggleButton = toolbar:CreateButton(BRAND, "Relier Studio à ton projet " .. BRAND, "rbxassetid://4458901886")
toggleButton.ClickableWhenViewportHidden = true

local widget = plugin:CreateDockWidgetPluginGui(
	BRAND .. "Widget",
	DockWidgetPluginGuiInfo.new(Enum.InitialDockState.Right, false, false, 320, 260, 260, 220)
)
widget.Title = BRAND

local COLORS = {
	bg = Color3.fromRGB(255, 251, 235),
	green = Color3.fromRGB(34, 197, 94),
	red = Color3.fromRGB(239, 68, 68),
	text = Color3.fromRGB(41, 37, 36),
	muted = Color3.fromRGB(120, 113, 108),
	yellow = Color3.fromRGB(250, 204, 21),
}

local root = Instance.new("Frame")
root.Size = UDim2.fromScale(1, 1)
root.BackgroundColor3 = COLORS.bg
root.BorderSizePixel = 0
root.Parent = widget

local padding = Instance.new("UIPadding")
padding.PaddingTop = UDim.new(0, 14)
padding.PaddingLeft = UDim.new(0, 14)
padding.PaddingRight = UDim.new(0, 14)
padding.Parent = root

local layout = Instance.new("UIListLayout")
layout.Padding = UDim.new(0, 10)
layout.SortOrder = Enum.SortOrder.LayoutOrder
layout.Parent = root

local function makeLabel(text, size, color, order)
	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, 0, 0, size + 8)
	label.BackgroundTransparency = 1
	label.Font = Enum.Font.FredokaOne
	label.TextSize = size
	label.TextColor3 = color
	label.TextWrapped = true
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.Text = text
	label.LayoutOrder = order
	label.Parent = root
	return label
end

local function makeButton(text, color, order)
	local button = Instance.new("TextButton")
	button.Size = UDim2.new(1, 0, 0, 40)
	button.BackgroundColor3 = color
	button.TextColor3 = Color3.new(1, 1, 1)
	button.Font = Enum.Font.FredokaOne
	button.TextSize = 18
	button.Text = text
	button.AutoButtonColor = true
	button.LayoutOrder = order
	button.Parent = root
	Instance.new("UICorner", button).CornerRadius = UDim.new(0, 12)
	return button
end

makeLabel("🏭 " .. BRAND, 22, COLORS.text, 1)
local statusLabel = makeLabel("", 15, COLORS.muted, 2)
statusLabel.Size = UDim2.new(1, 0, 0, 44)

local codeBox = Instance.new("TextBox")
codeBox.Size = UDim2.new(1, 0, 0, 44)
codeBox.BackgroundColor3 = Color3.new(1, 1, 1)
codeBox.TextColor3 = COLORS.text
codeBox.PlaceholderText = "Code du site (ex. K7P-4QZ)"
codeBox.Font = Enum.Font.FredokaOne
codeBox.TextSize = 20
codeBox.Text = ""
codeBox.ClearTextOnFocus = false
codeBox.LayoutOrder = 3
codeBox.Parent = root
Instance.new("UICorner", codeBox).CornerRadius = UDim.new(0, 12)
local stroke = Instance.new("UIStroke")
stroke.Color = COLORS.yellow
stroke.Thickness = 2
stroke.Parent = codeBox

local connectButton = makeButton("Connecter", COLORS.green, 4)
local disconnectButton = makeButton("Déconnecter", COLORS.red, 5)

-- ============ État ============
local token = plugin:GetSetting(TOKEN_KEY)
local lastVersion = -1
local polling = false

local function setStatus(text, color)
	statusLabel.Text = text
	statusLabel.TextColor3 = color or COLORS.muted
end

local function refreshUi()
	local connected = token ~= nil
	codeBox.Visible = not connected
	connectButton.Visible = not connected
	disconnectButton.Visible = connected
end

-- ============ HTTP ============
local function request(method, path, body)
	local headers = { ["Content-Type"] = "application/json" }
	if token then
		headers["Authorization"] = "Bearer " .. token
	end
	local ok, response = pcall(HttpService.RequestAsync, HttpService, {
		Url = SITE_URL .. path,
		Method = method,
		Headers = headers,
		Body = body and HttpService:JSONEncode(body) or nil,
	})
	if not ok then
		return nil, "Pas de connexion au site. Autorise " .. SITE_URL .. " si Studio le demande."
	end
	local decoded = nil
	pcall(function()
		decoded = HttpService:JSONDecode(response.Body)
	end)
	if not response.Success then
		return nil, (decoded and decoded.error) or ("Erreur " .. response.StatusCode), response.StatusCode
	end
	return decoded
end

-- ============ Application des scripts ============
local function getRootInstance(name)
	if name == "Workspace" then
		return workspace
	end
	local ok, service = pcall(game.GetService, game, name)
	return ok and service or nil
end

local function splitPath(path)
	local parts = {}
	for part in string.gmatch(path, "[^/]+") do
		table.insert(parts, part)
	end
	return parts
end

local function setSource(script, source)
	local ok = pcall(function()
		ScriptEditorService:UpdateSourceAsync(script, function()
			return source
		end)
	end)
	if not ok then
		script.Source = source
	end
end

local function ensureParent(parts)
	local current = getRootInstance(parts[1])
	if not current or not ALLOWED_ROOTS[parts[1]] then
		return nil
	end
	for i = 2, #parts - 1 do
		local child = current:FindFirstChild(parts[i])
		if not child then
			child = Instance.new("Folder")
			child.Name = parts[i]
			child:SetAttribute(MARK, true)
			child.Parent = current
		end
		current = child
	end
	return current
end

local function managedScripts()
	local found = {}
	for rootName in pairs(ALLOWED_ROOTS) do
		local rootInstance = getRootInstance(rootName)
		if rootInstance then
			for _, descendant in ipairs(rootInstance:GetDescendants()) do
				if descendant:IsA("LuaSourceContainer") and descendant:GetAttribute(MARK) then
					table.insert(found, descendant)
				end
			end
		end
	end
	return found
end

local function applyFiles(files)
	local recording = ChangeHistoryService:TryBeginRecording(BRAND .. " : synchronisation")
	local keep = {}
	local count = 0

	for _, file in ipairs(files) do
		local parts = splitPath(file.path)
		if #parts >= 2 and SCRIPT_CLASSES[file.className] then
			local parent = ensureParent(parts)
			if parent then
				local name = parts[#parts]
				local existing = parent:FindFirstChild(name)
				if existing and (existing.ClassName ~= file.className or not existing:GetAttribute(MARK)) then
					if existing:IsA("LuaSourceContainer") and existing:GetAttribute(MARK) then
						existing:Destroy()
					else
						name = name .. "_" .. BRAND -- on ne touche jamais à un script que tu as écrit toi-même
					end
					existing = parent:FindFirstChild(name)
				end
				if not existing then
					existing = Instance.new(file.className)
					existing.Name = name
					existing:SetAttribute(MARK, true)
					existing.Parent = parent
				end
				if existing.Source ~= file.source then
					setSource(existing, file.source)
				end
				keep[existing] = true
				count += 1
			end
		end
	end

	-- Supprime les scripts gérés par le plugin qui n'existent plus dans le projet
	for _, script in ipairs(managedScripts()) do
		if not keep[script] then
			script:Destroy()
		end
	end

	if recording then
		ChangeHistoryService:FinishRecording(recording, Enum.FinishRecordingOperation.Commit)
	end
	return count
end

-- ============ Boucle de synchronisation ============
local function disconnect(message)
	token = nil
	lastVersion = -1
	plugin:SetSetting(TOKEN_KEY, nil)
	setStatus(message or "Tape le code affiché sur le site pour relier ce jeu.")
	refreshUi()
end

local function pollOnce()
	if RunService:IsRunning() then
		return -- pas de synchronisation pendant un test (Play)
	end
	local data, err, status = request("GET", "/api/plugin/poll")
	if not data then
		if status == 401 or status == 404 then
			disconnect(err)
		else
			setStatus("⚠️ " .. tostring(err), COLORS.red)
		end
		return
	end
	if data.files and data.version ~= lastVersion then
		local count = applyFiles(data.files)
		local ack = request("POST", "/api/plugin/ack", { version = data.version })
		if ack then
			lastVersion = data.version
		end
		setStatus(("✅ %s — %d scripts synchronisés (v%d)"):format(data.projectName, count, data.version), COLORS.green)
	else
		setStatus(("🟢 Relié à « %s ». En attente des changements…"):format(data.projectName), COLORS.green)
	end
end

local function startPolling()
	if polling then
		return
	end
	polling = true
	task.spawn(function()
		while polling and token do
			pollOnce()
			task.wait(POLL_SECONDS)
		end
		polling = false
	end)
end

connectButton.Activated:Connect(function()
	local code = codeBox.Text:upper():gsub("%s", "")
	if #code < 6 then
		setStatus("Le code fait 6 caractères, par ex. K7P-4QZ.", COLORS.red)
		return
	end
	setStatus("Connexion…")
	local data, err = request("POST", "/api/plugin/connect", { code = code })
	if not data then
		setStatus("⚠️ " .. tostring(err), COLORS.red)
		return
	end
	token = data.token
	plugin:SetSetting(TOKEN_KEY, token)
	codeBox.Text = ""
	setStatus("🟢 Relié à « " .. data.projectName .. " » !", COLORS.green)
	refreshUi()
	startPolling()
end)

disconnectButton.Activated:Connect(function()
	polling = false
	disconnect()
end)

toggleButton.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)

widget:GetPropertyChangedSignal("Enabled"):Connect(function()
	toggleButton:SetActive(widget.Enabled)
end)

plugin.Unloading:Connect(function()
	polling = false
end)

refreshUi()
if token then
	setStatus("Reconnexion…")
	startPolling()
else
	setStatus("Tape le code affiché sur le site pour relier ce jeu.")
end

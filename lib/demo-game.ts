// Réponse utilisée quand aucune clé IA n'est configurée : un vrai petit jeu jouable, pour tester tout le circuit.
import type { GameFile } from "./types";

export function demoFiles(): GameFile[] {
  return [
    {
      path: "ServerScriptService/Leaderstats",
      className: "Script",
      source: `-- Crée l'argent de chaque joueur et en ajoute toutes les secondes
local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = player

	local coins = Instance.new("IntValue")
	coins.Name = "Coins"
	coins.Value = 0
	coins.Parent = leaderstats

	task.spawn(function()
		while player.Parent do
			task.wait(1)
			coins.Value += 1
		end
	end)
end)
`,
    },
    {
      path: "ServerScriptService/ClickGiver",
      className: "Script",
      source: `-- Reçoit les clics du joueur et ajoute des pièces (limité pour éviter la triche)
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local remote = Instance.new("RemoteEvent")
remote.Name = "ClickEvent"
remote.Parent = ReplicatedStorage

local lastClick = {}

remote.OnServerEvent:Connect(function(player)
	local now = os.clock()
	if lastClick[player] and now - lastClick[player] < 0.1 then
		return
	end
	lastClick[player] = now
	local stats = player:FindFirstChild("leaderstats")
	if stats and stats:FindFirstChild("Coins") then
		stats.Coins.Value += 5
	end
end)

game:GetService("Players").PlayerRemoving:Connect(function(player)
	lastClick[player] = nil
end)
`,
    },
    {
      path: "StarterPlayer/StarterPlayerScripts/CoinUI",
      className: "LocalScript",
      source: `-- Affiche le compteur de pièces et un gros bouton à cliquer
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local gui = Instance.new("ScreenGui")
gui.Name = "CoinUI"
gui.ResetOnSpawn = false
gui.Parent = player:WaitForChild("PlayerGui")

local label = Instance.new("TextLabel")
label.Size = UDim2.fromOffset(220, 56)
label.Position = UDim2.new(0.5, -110, 0, 16)
label.BackgroundColor3 = Color3.fromRGB(250, 204, 21)
label.TextColor3 = Color3.fromRGB(60, 40, 0)
label.Font = Enum.Font.FredokaOne
label.TextScaled = true
label.Text = "🪙 0"
label.Parent = gui
Instance.new("UICorner", label).CornerRadius = UDim.new(0, 16)

local button = Instance.new("TextButton")
button.Size = UDim2.fromOffset(180, 64)
button.Position = UDim2.new(0.5, -90, 1, -96)
button.BackgroundColor3 = Color3.fromRGB(34, 197, 94)
button.TextColor3 = Color3.new(1, 1, 1)
button.Font = Enum.Font.FredokaOne
button.TextScaled = true
button.Text = "CLIQUE +5"
button.Parent = gui
Instance.new("UICorner", button).CornerRadius = UDim.new(0, 16)

local clickEvent = ReplicatedStorage:WaitForChild("ClickEvent")
button.Activated:Connect(function()
	clickEvent:FireServer()
end)

local coins = player:WaitForChild("leaderstats"):WaitForChild("Coins")
local function refresh()
	label.Text = "🪙 " .. coins.Value
end
coins.Changed:Connect(refresh)
refresh()
`,
    },
  ];
}

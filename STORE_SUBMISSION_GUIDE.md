# Shibuya Bot Pit — Official App Store & Google Play Submission Guide

Everything in the codebase and `store_assets/` folder is pre-configured and ready for upload. Use this copy-paste cheat sheet when filling out **Apple App Store Connect** and **Google Play Console**.

---

## 1. Core App Identifiers & URLs
- **App Name**: `Shibuya Bot Pit — 3D BattleBots`
- **Short Name (Home Screen)**: `Shibuya Bot Pit`
- **Bundle ID / Package Name**: `com.retrocanopy.shibuyabotpit`
- **Primary Category**: `Games` -> `Action` / `Strategy`
- **Privacy Policy URL**: `https://retrocanopy.com/privacy.html`
- **Terms of Use & Ticket Rules URL**: `https://retrocanopy.com/privacy.html#ticket-rules`
- **Account & Data Deletion URL (Google Play Data Safety)**: `https://retrocanopy.com/privacy.html#delete-account`
- **Support / Marketing URL**: `https://retrocanopy.com/shibuya_bot_pit.html`

---

## 2. Store Listing Copy (Copy & Paste)

### Subtitle (30 chars max — Apple) / Short Description (80 chars max — Google)
- **Apple Subtitle**: `3D Mech Combat & 6-Slot Garage`
- **Google Short Description**: `Build your 6-Slot 3D BattleBot, clash in 3x3:00 arena rounds, and fight live PvP!`

### Full Description
```text
Enter the neon-drenched underground robotics arena of Neo-Tokyo in SHIBUYA BOT PIT!

Engineer your custom 3D Wheeled BattleBot across 6 modular hardware slots—Tires, Melee Weapons, Long-Range Weapons, Bot Abilities, and Weapon Overdrives—then drop into the hazard-filled BattleBox for intense 3x3:00 championship rounds.

KEY FEATURES:
• 🤖 SIMULATED OR 🎮 CONTROLLED COMBAT: Toggle anytime between autonomous AI tactical command or full manual twin-stick driving and weapon firing!
• 🔧 6-SLOT 3D MECH GARAGE & 135-NODE SKILL TREE: Unlock 30+ 3D-modeled saws, flippers, railguns, cryo emitters, and grapplers, plus 5 specialized Syndicate skill branches.
• ⚠️ REAL-TIME SUBSYSTEM BREAKDOWN & PIT REPAIR: Target your rival's Tires, Armor, Weapon, or Core to cripple their speed and firepower mid-fight, then repair in the Pit or fight injured for a +15% Underdog Grit XP bonus!
• 🌐 LIVE ONLINE PVP, SPECTATING & PIT CHAT: Clash against real pilots in synchronized PvP, watch live arena broadcasts in real time, and connect with rivals in Public Pit Chat and Private 1-on-1 DMs.
• ⚔️ 10-QUEST CAMPAIGN & SIMILAR-LEVEL CPU MATCHES: Battle through 10 escalating quests (including 1v3 Swarm Challenges and Boss Mechs) to earn Combat XP and Diamonds for free.

OFFICIAL GOLDEN TICKET RULE & DISCLAIMER:
Golden Tickets (🎟️) are earned strictly 1 at a time (+1 🎟️ per Live PvP Victory) through skill-based player-vs-player combat and are never sold for cash or Diamonds. Apple Inc. and Google LLC are not sponsors of, nor affiliated with, any RetroCanopy Ticket Counter rewards.
```

---

## 3. App Review Demo Account (Paste into "App Review Information")
Give Apple/Google reviewers these credentials so they can test immediately:
- **Username**: `REVIEWER`
- **Password**: `pilot123`
- **Reviewer Notes**:
  > "Log in with Username `REVIEWER` and Password `pilot123` (or create any new callsign in 1 click). You can switch between 🤖 SIMULATED and 🎮 CONTROLLED combat in the top bar, customize the 6-slot BattleBot in the Garage, battle in Quests 1-10 or Live PvP, test the profanity-filtered chat with 🚩 Report and 🚫 Block buttons, and test permanent account deletion via the 🗑️ DELETE ACCOUNT button in the top bar."

---

## 4. Age Rating & Content Questionnaire Answers
- **Violence**: *Cartoon or Fantasy Violence (Mild/Infrequent)* — Robots/Mechs clashing with sparks in a top-down arena (no human characters, blood, or gore).
- **User Interaction / UGC**: *Yes* — Includes Public Chat and Private DMs with an active profanity filter, `🚩 Report` button, and `🚫 Block` button on every message.
- **Gambling / Contests**: *No Real-Money Gambling* — Diamonds (💎) cannot be cashed out, and Golden Tickets (🎟️) are never sold and can only be won 1 at a time from skill-based PvP victories.

---

## 5. Pre-Built Store Assets (`store_assets/` folder)
All required dimensions have been exported and verified in `store_assets/`:
- `app_store_icon_1024x1024.png` — Apple App Store Icon (1024×1024 RGB PNG, zero transparency)
- `google_play_icon_512x512.png` — Google Play Store Hi-Res Icon (512×512 PNG)
- `google_play_feature_graphic_1024x500.png` — Google Play Store Feature Graphic (1024×500 PNG)
- `launch_splash_2732x2732.png` — Universal Launch Splash Screen (2732×2732 PNG)
- `iphone_67_1290x2796_1_arena.png` & `iphone_67_1290x2796_2_shop.png` — iPhone 6.7" Display Screenshots (1290×2796 PNG)
- `ipad_129_2048x2732_1_arena.png` — iPad Pro 12.9" Display Screenshot (2048×2732 PNG)
- `android_phone_1080x1920_1_arena.png` — Android Phone Screenshot (1080×1920 PNG)

---

## 6. In-App Purchase Product IDs (When Enabling Real-Money Diamond Packs)
Create these 5 **Consumable** In-App Purchase products in App Store Connect & Google Play Console:
| In-Game Pack ID | Store Product ID | Type | Price | Diamonds Credited |
| :--- | :--- | :--- | :--- | :--- |
| `pack_starter` | `com.retrocanopy.shibuyabotpit.pack_starter` | Consumable | \$0.99 | 500 💎 |
| `pack_pit_fighter` | `com.retrocanopy.shibuyabotpit.pack_pit_fighter` | Consumable | \$2.99 | 1,650 💎 (1,500 + 150) |
| `pack_champion_crate` | `com.retrocanopy.shibuyabotpit.pack_champion_crate` | Consumable | \$4.99 | 4,200 💎 (3,500 + 700) |
| `pack_shibuya_king` | `com.retrocanopy.shibuyabotpit.pack_shibuya_king` | Consumable | \$9.99 | 10,000 💎 (8,000 + 2,000) |
| `pack_founders_vault` | `com.retrocanopy.shibuyabotpit.pack_founders_vault` | Consumable | \$19.99 | 25,000 💎 (20,000 + 5,000) |

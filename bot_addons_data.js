// ============================================================================
// SHARED DATA: 80 BOT ADD-ONS & ABILITIES (4 TYPES x 20 PIECES EACH)
// + MAP 01: 10-LEVEL CAMPAIGN & ENEMY ROSTER
// ============================================================================

window.BOT_ADDONS_CATALOG = {
  // --------------------------------------------------------------------------
  // TYPE 1: TIRE UPGRADES (1 Slot — 20 Concept Pieces)
  // --------------------------------------------------------------------------
  tires: [
    {
      id: "tire_01", num: 1, code: "TIRE-01", name: "Vulcanized Off-Road Lug Tires",
      cost: 100, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/tire_01.jpg",
      stats: { power: 2, speed: 5, agility: 5, hp: 20 },
      effect: "Balanced all-terrain rubber lugs that increase base acceleration by +8% and reduce floor slip after collisions.",
      whatItDoes: "Provides reliable grip across steel grating, boosting launch acceleration and stabilizing recovery after a clash."
    },
    {
      id: "tire_02", num: 2, code: "TIRE-02", name: "Tungsten-Studded Ice-Grip Tires",
      cost: 140, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/tire_02.jpg",
      stats: { power: 6, speed: 3, agility: 7, hp: 25 },
      effect: "+18% Traction & +12% Shove Resistance; carbide studs bite into the arena steel deck.",
      whatItDoes: "Digs hardened tungsten studs into the metal floor so enemy rams push you 18% less distance toward the center saw."
    },
    {
      id: "tire_03", num: 3, code: "TIRE-03", name: "Wide Slick Drag-Compound Tires",
      cost: 160, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/tire_03.jpg",
      stats: { power: 0, speed: 14, agility: 2, hp: 10 },
      effect: "+22% Straight-Line Top Speed & +25% Bull-Charge launch velocity.",
      whatItDoes: "Ultra-wide soft racing slicks maximize straight-line sprint speed and kinetic ramming velocity across the pit."
    },
    {
      id: "tire_04", num: 4, code: "TIRE-04", name: "Omni-Directional Mecanum Rollers",
      cost: 210, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/tire_04.jpg",
      stats: { power: 2, speed: 6, agility: 16, hp: 20 },
      effect: "+30% Turn Rate & Instant Lateral Strafe; allows 90° saw-dodging without turning the hull.",
      whatItDoes: "Angled 45° barrel rollers let your bot strafe sideways out of the Center Saw lane while keeping your front armor aimed at the enemy."
    },
    {
      id: "tire_05", num: 5, code: "TIRE-05", name: "Bulldozer Steel Caterpillar Tracks",
      cost: 240, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/tire_05.jpg",
      stats: { power: 16, speed: -3, agility: 4, hp: 65 },
      effect: "+35% Knockback Shove Force & +65 Max HP; heavy linked steel tank treads.",
      whatItDoes: "Replaces standard wheels with armored tank tracks that turn your bot into an immovable bulldozer capable of shoving enemies straight into the saw."
    },
    {
      id: "tire_06", num: 6, code: "TIRE-06", name: "Saw-Tooth Rim Shredder Tires",
      cost: 260, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/tire_06.jpg",
      stats: { power: 10, speed: 8, agility: 6, hp: 30 },
      effect: "Deals +18 Grinding Damage whenever an enemy sideswipes your wheels.",
      whatItDoes: "Mounts serrated steel saw-rims onto all 4 hubs, punishing agile flankers who try to rub against your side armor."
    },
    {
      id: "tire_07", num: 7, code: "TIRE-07", name: "Pneumatic Airless Honeycomb Tires",
      cost: 280, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/tire_07.jpg",
      stats: { power: 5, speed: 8, agility: 10, hp: 45 },
      effect: "-40% Knock-Stun Duration after heavy impacts or wall slams.",
      whatItDoes: " hexagonal shock-absorbing polymer spokes compress on impact, letting your bot recover control almost immediately after being rammed."
    },
    {
      id: "tire_08", num: 8, code: "TIRE-08", name: "Electromagnetic Mag-Grip Wheels",
      cost: 320, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/tire_08.jpg",
      stats: { power: 12, speed: 6, agility: 12, hp: 40 },
      effect: "Energizes wheel hubs to clamp onto the steel floor, reducing incoming knockback by 28%.",
      whatItDoes: "Generates a localized magnetic field between your axles and the Arena-10 floor deck for zero-slip cornering and anti-shove anchoring."
    },
    {
      id: "tire_09", num: 9, code: "TIRE-09", name: "Dual-Dually Twin-Axle Hauler Tires",
      cost: 350, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/tire_09.jpg",
      stats: { power: 18, speed: 4, agility: 2, hp: 80 },
      effect: "8-Wheel double-wide footprint grants +40% pushing torque and +80 HP frame stability.",
      whatItDoes: "Doubles the tire contact patch with twin side-by-side wheels on every corner, overpowering single-tire rivals in head-on clashes."
    },
    {
      id: "tire_10", num: 10, code: "TIRE-10", name: "Gyro-Stabilized Spherical Ball-Drive",
      cost: 380, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/tire_10.jpg",
      stats: { power: 4, speed: 12, agility: 20, hp: 30 },
      effect: "360° omnidirectional carbon spheres grant +45% pivot speed and instant rear-flank orbiting.",
      whatItDoes: "Replaces fixed axles with motorized ball-bearings that pivot in any direction instantaneously to circle behind slow opponents."
    },
    {
      id: "tire_11", num: 11, code: "TIRE-11", name: "Spiked Titanium Cleat Crusher Tires",
      cost: 410, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/tire_11.jpg",
      stats: { power: 15, speed: 9, agility: 8, hp: 45 },
      effect: "+20% Ramming Impulse & +15 Bonus Armor-Piercing Tread Damage on front charges.",
      whatItDoes: "Deep titanium trench cleats launch your bot forward like a catapult and gouge enemy armor plating during high-speed collisions."
    },
    {
      id: "tire_12", num: 12, code: "TIRE-12", name: "Low-Friction Drift-Teflon Skid Wheels",
      cost: 440, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/tire_12.jpg",
      stats: { power: 3, speed: 16, agility: 18, hp: 25 },
      effect: "Enables J-Turn powerslides around enemy charges while maintaining 95% momentum.",
      whatItDoes: "Slick composite outer rings let your bot whip its tail around an oncoming charger and immediately counter-ram their exposed rear."
    },
    {
      id: "tire_13", num: 13, code: "TIRE-13", name: "Hydraulic Articulated Crawler Half-Tracks",
      cost: 480, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/tire_13.jpg",
      stats: { power: 20, speed: 7, agility: 9, hp: 90 },
      effect: "Combines front steering wheels with rear tank tracks for +32% shove force and sharp turn-in.",
      whatItDoes: "Gives you the heavy pushing power of tank treads in the rear without sacrificing front-axle steering responsiveness."
    },
    {
      id: "tire_14", num: 14, code: "TIRE-14", name: "Super-Heated Molten-Tread Thermal Tires",
      cost: 520, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/tire_14.jpg",
      stats: { power: 12, speed: 18, agility: 12, hp: 40 },
      effect: "Melts into the surface for +28% launch grip and leaves a scorching spark trail.",
      whatItDoes: "Internal induction coils heat the tire compound to optimal racing temperature, delivering explosive sprint bursts across the pit."
    },
    {
      id: "tire_15", num: 15, code: "TIRE-15", name: "Carbon-Fiber Ultra-Light Sprint Wheels",
      cost: 550, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/tire_15.jpg",
      stats: { power: 2, speed: 24, agility: 18, hp: 15 },
      effect: "Reduces unsprung rotational mass for +35% top speed and -25% dodge cooldown.",
      whatItDoes: "Featherweight aerospace carbon rims spin up instantaneously, letting your bot outrun any hazard in the arena."
    },
    {
      id: "tire_16", num: 16, code: "TIRE-16", name: "Shock-Absorbing Leaf-Spring Monster Tires",
      cost: 590, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/tire_16.jpg",
      stats: { power: 18, speed: 10, agility: 10, hp: 110 },
      effect: "Absorbs 30% of head-on collision damage and rebounds enemies backward.",
      whatItDoes: "Oversized heavy-equipment tires mounted on spring-steel suspension struts soak up brutal hits and bounce attackers away."
    },
    {
      id: "tire_17", num: 17, code: "TIRE-17", name: "Razor-Flange Hubcap Slasher Wheels",
      cost: 630, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/tire_17.jpg",
      stats: { power: 16, speed: 14, agility: 14, hp: 55 },
      effect: "Spinning chariot-style hub blades inflict +26 Slash Damage on side/flank passes.",
      whatItDoes: "Extends hardened steel slasher cones from every wheel hub, turning high-speed drive-bys into lethal slicing attacks."
    },
    {
      id: "tire_18", num: 18, code: "TIRE-18", name: "Vacuum-Suction Downforce Turbine Tires",
      cost: 680, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/tire_18.jpg",
      stats: { power: 16, speed: 16, agility: 22, hp: 65 },
      effect: "Internal hub fans suck the bot to the floor: +40% cornering grip & immunity to flipper launches.",
      whatItDoes: "Uses centrifugal suction turbines inside each wheel to glue your chassis to the deck at high speeds."
    },
    {
      id: "tire_19", num: 19, code: "TIRE-19", name: "Chain-Wrapped Armored Forestry Tires",
      cost: 740, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/tire_19.jpg",
      stats: { power: 24, speed: 10, agility: 12, hp: 130 },
      effect: "Titanium logging chains grant +45% shove power, +130 HP, and saw-shred resistance.",
      whatItDoes: "Wraps massive industrial tires in forged titanium chains that shrug off arena saw hits and bulldoze rivals effortlessly."
    },
    {
      id: "tire_20", num: 20, code: "TIRE-20", name: "24K Gold & Gunmetal Apex Omni-Treads",
      cost: 900, tier: "Tier 5 (Apex)",
      img: "assets/concept_gallery/addons_80/tire_20.jpg",
      stats: { power: 25, speed: 24, agility: 25, hp: 140 },
      effect: "Championship hybrid omni-tracks: +35% Speed, +40% Turn Rate, +40% Shove Force & +140 HP.",
      whatItDoes: "The ultimate Shibuya Bot-Pit championship drive system—combining tank-track shove torque with omnidirectional strafe agility."
    }
  ],

  // --------------------------------------------------------------------------
  // TYPE 2: WEAPON UPGRADES (2 Slots — 20 Concept Pieces)
  // --------------------------------------------------------------------------
  weapons: [
    {
      id: "wpn_01", num: 1, code: "WPN-01", name: "Heavy Sloped Bulldozer Wedge Plow",
      cost: 120, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/wpn_01.jpg",
      stats: { power: 10, speed: 0, agility: 2, hp: 40 },
      effect: "+25% Knockback Shove Distance & +12% Front Armor Deflection.",
      whatItDoes: "Scoops underneath enemy bumpers on head-on contact, breaking their floor traction and launching them toward the Center Saw."
    },
    {
      id: "wpn_02", num: 2, code: "WPN-02", name: "Front-Mounted Circular Tungsten Rip-Saw",
      cost: 160, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/wpn_02.jpg",
      stats: { power: 14, speed: 2, agility: 0, hp: 15 },
      effect: "+22 Continuous Shred Damage on front-arc contact; showers sparks.",
      whatItDoes: "Mounts a high-RPM circular tungsten saw blade on your front bumper that slices deep into enemy plating during rams."
    },
    {
      id: "wpn_03", num: 3, code: "WPN-03", name: "Twin Hydraulic Pincer Crusher Jaws",
      cost: 190, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/wpn_03.jpg",
      stats: { power: 16, speed: -2, agility: 4, hp: 35 },
      effect: "Clamps onto enemies for 0.6s on impact, dealing +28 Crush Damage and guiding them toward the saw.",
      whatItDoes: "Dual hydraulic jaws bite down on rival hulls upon collision, briefly locking them in place while you push them into danger."
    },
    {
      id: "wpn_04", num: 4, code: "WPN-04", name: "High-RPM Horizontal Bar Spinner",
      cost: 230, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/wpn_04.jpg",
      stats: { power: 20, speed: 0, agility: -2, hp: 20 },
      effect: "+34 Kinetic Impact Damage & violent lateral knockback on contact.",
      whatItDoes: "Spins a solid 40-lb hardened steel bar at 4,000 RPM across your bow, delivering devastating shockwaves that send rivals flying."
    },
    {
      id: "wpn_05", num: 5, code: "WPN-05", name: "Pneumatic Flipper Launch Ramp",
      cost: 250, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/wpn_05.jpg",
      stats: { power: 15, speed: 4, agility: 6, hp: 30 },
      effect: "+45% Knockback Impulse & inflicts a 0.8s landing stun on flipped targets.",
      whatItDoes: "Fires a high-pressure nitrogen hinge that hurls enemy bots across the arena floor, leaving them stunned on landing."
    },
    {
      id: "wpn_06", num: 6, code: "WPN-06", name: "Overhead Swinging Sledgehammer Arm",
      cost: 280, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/wpn_06.jpg",
      stats: { power: 22, speed: 0, agility: 2, hp: 25 },
      effect: "Strikes top armor where plating is thin, ignoring 35% of enemy Defense Rating.",
      whatItDoes: "Swings a pneumatic tungsten maul down onto the opponent's top deck during clashes, bypassing their thick front bumper guard."
    },
    {
      id: "wpn_07", num: 7, code: "WPN-07", name: "Dual Counter-Rotating Vertical Drum Spinners",
      cost: 310, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/wpn_07.jpg",
      stats: { power: 24, speed: 3, agility: 3, hp: 35 },
      effect: "+38 Uppercut Grinding Damage & destabilizes enemy steering for 1.0s.",
      whatItDoes: "Twin toothed steel drums spin upward at high speed, chewing through front armor and kicking the enemy off-balance."
    },
    {
      id: "wpn_08", num: 8, code: "WPN-08", name: "Hardened Titanium Corkscrew Auger Drill",
      cost: 340, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/wpn_08.jpg",
      stats: { power: 26, speed: 2, agility: 0, hp: 30 },
      effect: "Bores through heavy armor, ignoring 50% of enemy Defense and dealing +32 Pierce Damage.",
      whatItDoes: "A rotating spiral titanium drill cone that punches straight through high-Defense tank builds."
    },
    {
      id: "wpn_09", num: 9, code: "WPN-09", name: "Spring-Loaded Battering Ram Pike",
      cost: 370, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/wpn_09.jpg",
      stats: { power: 22, speed: 8, agility: 4, hp: 25 },
      effect: "Scales damage with your movement speed (+45% Velocity Lance Multiplier).",
      whatItDoes: "Releases a spring-loaded tungsten spike at the moment of high-speed impact, turning Speed builds into lethal lancers."
    },
    {
      id: "wpn_10", num: 10, code: "WPN-10", name: "Articulated Backhoe Grappler Claw",
      cost: 400, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/wpn_10.jpg",
      stats: { power: 24, speed: 0, agility: 6, hp: 50 },
      effect: "Grapples enemies on impact and drags them +40% closer to the Center Saw track.",
      whatItDoes: "Hooks over the enemy's chassis with an overhead hydraulic claw, letting you steer and herd them directly into the middle saw."
    },
    {
      id: "wpn_11", num: 11, code: "WPN-11", name: "Twin Angled Side-Skirt Saw Blades",
      cost: 440, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/wpn_11.jpg",
      stats: { power: 18, speed: 6, agility: 12, hp: 40 },
      effect: "Expands your attack arc to the left and right flanks (+30 Flank Slash Damage).",
      whatItDoes: "Mounts dual spinning circular saws along your left and right fenders so even glancing side-passes shred the opponent."
    },
    {
      id: "wpn_12", num: 12, code: "WPN-12", name: "Full-Body Ring Spinner Shell",
      cost: 480, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/wpn_12.jpg",
      stats: { power: 28, speed: 2, agility: 8, hp: 65 },
      effect: "360° spinning outer ring deals damage from ALL angles and negates enemy Rear/Flank crits!",
      whatItDoes: "Encases your chassis in a revolving toothed steel ring—any bot that touches your sides or rear takes full spinner damage."
    },
    {
      id: "wpn_13", num: 13, code: "WPN-13", name: "Hydraulic Guillotine Shear Blade",
      cost: 520, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/wpn_13.jpg",
      stats: { power: 34, speed: 0, agility: 4, hp: 30 },
      effect: "+55% Critical Damage against enemies below 50% HP (Executioner Strike).",
      whatItDoes: "A massive angled shear blade driven by twin hydraulic cylinders that cleaves weakened armor plates in half."
    },
    {
      id: "wpn_14", num: 14, code: "WPN-14", name: "Triple-Tipped Tungsten Forklift Tines",
      cost: 560, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/wpn_14.jpg",
      stats: { power: 26, speed: 6, agility: 8, hp: 55 },
      effect: "Lifts & carries opponents across the floor with +50% Shove Force and +28 Impale Damage.",
      whatItDoes: "Three low-clearance forged forklift forks slide under any bot and heave them straight into the center hazard trench."
    },
    {
      id: "wpn_15", num: 15, code: "WPN-15", name: "Heavy Spiked Wrecking-Ball Flail Boom",
      cost: 600, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/wpn_15.jpg",
      stats: { power: 32, speed: 4, agility: 14, hp: 45 },
      effect: "whips a spiked tungsten sphere during fast turns for +42 Rotational Smash Damage.",
      whatItDoes: "Converts high Agility turn-rate into devastating centrifugal flail strikes that smash enemies from unexpected angles."
    },
    {
      id: "wpn_16", num: 16, code: "WPN-16", name: "V-Shaped Deflector Snowplow Cowcatcher",
      cost: 640, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/wpn_16.jpg",
      stats: { power: 28, speed: 8, agility: 4, hp: 95 },
      effect: "+22% Front Guard Block, +95 HP, and deflects enemy Bull-Charges harmlessly to the side.",
      whatItDoes: "An armored locomotive-style V-plow that shrugs off head-on impacts and redirects charging enemies into the arena walls."
    },
    {
      id: "wpn_17", num: 17, code: "WPN-17", name: "Twin Pneumatic Spike-Punch Pistons",
      cost: 690, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/wpn_17.jpg",
      stats: { power: 38, speed: 6, agility: 6, hp: 50 },
      effect: "Fires dual rapid-fire tungsten rams on contact: +48 Impact Damage & double knockback impulse.",
      whatItDoes: "Explosively extends twin solid-steel punch rods at 120 psi the instant an enemy enters your front bumper arc."
    },
    {
      id: "wpn_18", num: 18, code: "WPN-18", name: "Industrial Rock-Grinder Toothed Cylinder",
      cost: 750, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/wpn_18.jpg",
      stats: { power: 42, speed: 2, agility: 4, hp: 75 },
      effect: "Mining-grade carbide drum chews through armor: +52 Damage & permanently shreds enemy Defense by 15%.",
      whatItDoes: "A massive tunnel-boring cutter head mounted across your front hull that pulverizes even the thickest armor plating."
    },
    {
      id: "wpn_19", num: 19, code: "WPN-19", name: "Magnetic Clamp & Grinding Disc Rig",
      cost: 820, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/wpn_19.jpg",
      stats: { power: 40, speed: 8, agility: 12, hp: 70 },
      effect: "Magnetically locks onto enemy hulls while a high-speed diamond disc grinds for +56 Damage.",
      whatItDoes: "Uses an electromagnet bumper to hold the rival against a 9,000-RPM diamond cutting wheel before flinging them into the saw."
    },
    {
      id: "wpn_20", num: 20, code: "WPN-20", name: "24K Gold & Crimson Twin-Saw Executioner Boom",
      cost: 950, tier: "Tier 5 (Apex)",
      img: "assets/concept_gallery/addons_80/wpn_20.jpg",
      stats: { power: 50, speed: 12, agility: 12, hp: 100 },
      effect: "Dual-blade hydraulic saw boom: +68 Shred Damage, +45% Knockback Shove, and +100 HP.",
      whatItDoes: "The apex melee weapon of the Shibuya Bot-Pit—twin overlapping tungsten-carbide circular saws mounted on reinforced hydraulic arms."
    }
  ],

  // --------------------------------------------------------------------------
  // TYPE 2B: WEAPON UPGRADE 2 — LONG-RANGE WEAPONS (1 Slot — 20 Ranged Turrets & Launchers)
  // --------------------------------------------------------------------------
  rangedWeapons: [
    {
      id: "rng_01", num: 1, code: "RNG-01", name: "Twin-Barrel Gauss Railgun Turret",
      cost: 240, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_01.png?v=pbr4",
      stats: { power: 22, speed: -2, agility: 6, hp: 20 },
      effect: "Fires hyper-velocity tungsten rail-slugs across the arena every 1.7s for +54 Armor-Piercing Damage & knockback!",
      whatItDoes: "Dorsal electromagnetic sniper turret that automatically locks onto distant rivals and blasts them toward the Center Saw."
    },
    {
      id: "rng_02", num: 2, code: "RNG-02", name: "Pneumatic Harpoon Bolt Ballista",
      cost: 160, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_01.png?v=pbr4",
      stats: { power: 14, speed: 2, agility: 4, hp: 25 },
      effect: "Launches heavy steel rebar bolts at long range every 1.9s for +38 Pierce Damage.",
      whatItDoes: "High-tension pneumatic crossbow turret that punctures enemy armor plating from across the pit."
    },
    {
      id: "rng_03", num: 3, code: "RNG-03", name: "Twin Autoloader Grenade Thumper",
      cost: 210, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_13.png?v=pbr4",
      stats: { power: 18, speed: 0, agility: 2, hp: 30 },
      effect: "Lobs concussive frag shells at medium-long range for +42 Blast Damage and 20% knockback.",
      whatItDoes: "Drum-fed rotary grenade launcher that pelts opponents from afar before they can close into melee range."
    },
    {
      id: "rng_04", num: 4, code: "RNG-04", name: "Quad-Pod Homing Micro-Missile Swarm Rack",
      cost: 340, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_04.png?v=pbr4",
      stats: { power: 24, speed: -3, agility: 4, hp: 40 },
      effect: "Fires a salvo of 3 homing micro-missiles every 2.2s that curve in flight to deal 3x 24 Explosive Blast Damage!",
      whatItDoes: "Twin shoulder-mounted 8-tube missile pods that track dodging flankers and detonate on impact with concussive shockwaves."
    },
    {
      id: "rng_05", num: 5, code: "RNG-05", name: "High-Pressure Slag-Shot Scatter Cannon",
      cost: 280, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_13.png?v=pbr4",
      stats: { power: 20, speed: 2, agility: 5, hp: 35 },
      effect: "Blasts a wide cone of superheated shrapnel pellets for +44 Spread Damage.",
      whatItDoes: "Wide-bore flak turret designed to punish fast-moving agile bots attempting to orbit your flanks."
    },
    {
      id: "rng_06", num: 6, code: "RNG-06", name: "Cryo-Shard Icicle Rail-Thrower",
      cost: 320, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_01.png?v=pbr4",
      stats: { power: 19, speed: 4, agility: 8, hp: 30 },
      effect: "Fires sub-zero nitrogen lances from afar that deal +38 Damage and chill enemy motors (-25% Speed).",
      whatItDoes: "Long-range cryogenic dart cannon that slows down incoming chargers before they reach your front bumper."
    },
    {
      id: "rng_07", num: 7, code: "RNG-07", name: "Twin Shoulder Dumbfire Rocket Battery",
      cost: 360, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_04.png?v=pbr4",
      stats: { power: 26, speed: 0, agility: 2, hp: 45 },
      effect: "Unleashes twin high-impulse unguided rockets for +52 Direct Blast Damage.",
      whatItDoes: "Heavy armor-plated rocket tubes that hammer straight-line chargers with devastating kinetic explosions."
    },
    {
      id: "rng_08", num: 8, code: "RNG-08", name: "Heavy Rotary Vulcan Saw-Disc Launcher",
      cost: 420, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_08.png?v=pbr4",
      stats: { power: 26, speed: 4, agility: 10, hp: 35 },
      effect: "Rapid-fires spinning serrated titanium saw-discs every 0.95s that ricochet off arena walls up to 2 times (+36 Slash Damage)!",
      whatItDoes: "Electromagnetic disc-catapult that fills the arena with bouncing high-RPM buzzsaw blades that shred enemies from every angle."
    },
    {
      id: "rng_09", num: 9, code: "RNG-09", name: "Electro-Magnetic Arc-Ball Projector",
      cost: 450, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_18.png?v=pbr4",
      stats: { power: 24, speed: 4, agility: 8, hp: 40 },
      effect: "Fires slow-moving ball-lightning orbs across the pit that deal +44 Shock Damage and briefly disrupt steering.",
      whatItDoes: "Generates floating spheres of high-voltage plasma that zone enemies toward the middle saw trench."
    },
    {
      id: "rng_10", num: 10, code: "RNG-10", name: "Armor-Piercing Sabot Sniper Cannon",
      cost: 480, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_01.png?v=pbr4",
      stats: { power: 30, speed: -2, agility: 6, hp: 35 },
      effect: "Long-barrel fin-stabilized sabot rounds ignore 40% of enemy Defense at long range.",
      whatItDoes: "Precision turret cannon built to crack open heavy tank builds from across the arena."
    },
    {
      id: "rng_11", num: 11, code: "RNG-11", name: "Magnetic Boomerang Chakram Slinger",
      cost: 500, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_08.png?v=pbr4",
      stats: { power: 25, speed: 6, agility: 12, hp: 35 },
      effect: "Hurls curving serrated steel chakrams that bank off walls for +40 Flank Slash Damage.",
      whatItDoes: "Uses angled magnetic rails to curve spinning blades around an opponent's front guard."
    },
    {
      id: "rng_12", num: 12, code: "RNG-12", name: "Quad-Tube Bunker-Buster Torpedo Pod",
      cost: 510, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_04.png?v=pbr4",
      stats: { power: 32, speed: -4, agility: 2, hp: 60 },
      effect: "Heavy shaped-charge warheads deal +58 Blast Damage and shove rivals toward the saw.",
      whatItDoes: "Fires heavy rocket-assisted torpedoes that detonate with enough force to rock the entire arena."
    },
    {
      id: "rng_13", num: 13, code: "RNG-13", name: "High-Voltage Plasma Siege Mortar & Napalm Lobber",
      cost: 520, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_13.png?v=pbr4",
      stats: { power: 32, speed: -3, agility: 4, hp: 55 },
      effect: "Lobs arcing superheated plasma shells over front shields every 2.4s for +50 Blast Damage + 3.0s Molten Burn DoT!",
      whatItDoes: "Heavy dorsal artillery mortar that rains liquid plasma down onto the enemy's vulnerable top deck and sets their hull ablaze."
    },
    {
      id: "rng_14", num: 14, code: "RNG-14", name: "Twin-Linked Pulse-Laser Gatling Turret",
      cost: 560, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_18.png?v=pbr4",
      stats: { power: 28, speed: 6, agility: 12, hp: 40 },
      effect: "Rapid-fires ruby pulse-laser bolts at long range for continuous suppression damage.",
      whatItDoes: "High-speed optical turret that tracks fast-moving targets with zero projectile travel delay."
    },
    {
      id: "rng_15", num: 15, code: "RNG-15", name: "Thermobaric Fuel-Air Howitzer",
      cost: 590, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_13.png?v=pbr4",
      stats: { power: 36, speed: -4, agility: 2, hp: 65 },
      effect: "Creates a massive vacuum-pressure shockwave on impact for +56 Damage and +40% Knockback.",
      whatItDoes: "Heavy siege howitzer that blasts opponents out of position and straight into the Center Saw path."
    },
    {
      id: "rng_16", num: 16, code: "RNG-16", name: "Hyper-Velocity Coilgun Sniper Array",
      cost: 620, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_01.png?v=pbr4",
      stats: { power: 35, speed: 2, agility: 10, hp: 45 },
      effect: "Multi-stage induction coils fire Mach-6 tungsten rods for +62 Piercing Damage.",
      whatItDoes: "Upgraded synchronous coilgun turret with instant projectile velocity and deep armor penetration."
    },
    {
      id: "rng_17", num: 17, code: "RNG-17", name: "Diamond-Edge Ricochet Ripper Cannon",
      cost: 630, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_08.png?v=pbr4",
      stats: { power: 34, speed: 8, agility: 14, hp: 50 },
      effect: "Fires industrial diamond-tipped saw discs that bounce 3 times across the arena floor.",
      whatItDoes: "Turns the entire enclosed dome into a lethal pinball machine of ricocheting diamond-tooth blades."
    },
    {
      id: "rng_18", num: 18, code: "RNG-18", name: "Continuous-Beam Tesla Arc & Laser Obliterator",
      cost: 640, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_18.png?v=pbr4",
      stats: { power: 36, speed: 4, agility: 14, hp: 50 },
      effect: "Locks onto long-range enemies with a searing crimson-violet beam (1.1s duration) for +66 Beam Damage & -35% Turn Slow!",
      whatItDoes: "Twin-prong prism obliterator that melts enemy armor from across the arena with an inescapable lock-on energy beam."
    },
    {
      id: "rng_19", num: 19, code: "RNG-19", name: "Hydra 12-Tube Smart-Swarm Missile Pod",
      cost: 760, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_04.png?v=pbr4",
      stats: { power: 40, speed: 2, agility: 10, hp: 75 },
      effect: "Unleashes relentless homing micro-missile volleys that hunt down targets anywhere in the pit.",
      whatItDoes: "Military-grade multi-target missile battery with active radar guidance and high-explosive warheads."
    },
    {
      id: "rng_20", num: 20, code: "RNG-20", name: "24K Gold Omega Orbital Rail-Laser Turret",
      cost: 920, tier: "Tier 5 (Apex)",
      img: "assets/concept_gallery/addons_80/transparent_20/rng_18.png?v=pbr4",
      stats: { power: 48, speed: 12, agility: 18, hp: 95 },
      effect: "APEX LONG-RANGE TURRET: Combines hyper-velocity rail slugs with lock-on laser beams for +74 Ranged Damage!",
      whatItDoes: "The ultimate Shibuya Bot-Pit long-range weapon system—dominates the arena from afar before rivals can even get close."
    }
  ],

  // --------------------------------------------------------------------------
  // TYPE 3: BOT ABILITIES (2 Slots — 20 Concept Pieces)
  // --------------------------------------------------------------------------
  botAbilities: [
    {
      id: "bot_abil_01", num: 1, code: "BOT-ABIL-01", name: "Lateral Micro-Thruster Sidestep Jets",
      cost: 130, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/bot_abil_01.jpg",
      stats: { power: 0, speed: 8, agility: 12, hp: 15 },
      effect: "ACTIVE (2.5s CD): Fires side-mounted compressed-gas jets to dodge 90° out of saw or charge lanes.",
      whatItDoes: "Blasts your bot sideways when an enemy Bull-Charge or the Center Saw approaches, leaving attackers hitting empty air."
    },
    {
      id: "bot_abil_02", num: 2, code: "BOT-ABIL-02", name: "Bull-Charge Nitrous Afterburner Core",
      cost: 160, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/bot_abil_02.jpg",
      stats: { power: 10, speed: 12, agility: 0, hp: 20 },
      effect: "ACTIVE (3.2s CD): Injects nitrous into the drive core, boosting Bull-Charge speed and impact force by +35%.",
      whatItDoes: "Ignites rear afterburner vents during a Bull-Charge, turning your chassis into a high-velocity battering ram."
    },
    {
      id: "bot_abil_03", num: 3, code: "BOT-ABIL-03", name: "Electromagnetic Floor-Lock Anchor Clamp",
      cost: 190, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/bot_abil_03.jpg",
      stats: { power: 14, speed: 0, agility: 4, hp: 50 },
      effect: "PASSIVE/REACTIVE: Reduces incoming knockback by 45% when struck near the Center Saw.",
      whatItDoes: "Automatically fires a magnetic floor clamp when an enemy tries to shove you toward the active Center Saw."
    },
    {
      id: "bot_abil_04", num: 4, code: "BOT-ABIL-04", name: "360° Kinetic Repulsor Pulse Dome",
      cost: 220, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/bot_abil_04.jpg",
      stats: { power: 12, speed: 4, agility: 8, hp: 40 },
      effect: "ACTIVE (4.0s CD): Emits a radial shockwave when surrounded or flanked, blasting the rival backward.",
      whatItDoes: "Discharges a 360-degree kinetic pulse ring that interrupts enemy flank combos and shoves nearby foes toward the center trench."
    },
    {
      id: "bot_abil_05", num: 5, code: "BOT-ABIL-05", name: "Reactive Ablative Armor Flash-Plating",
      cost: 250, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/bot_abil_05.jpg",
      stats: { power: 10, speed: 0, agility: 4, hp: 85 },
      effect: "REACTIVE: Reduces damage from the first 3 heavy hits or saw contacts by 50% and reflects sparks.",
      whatItDoes: "Explosive reactive armor tiles detonate outward upon impact, neutralizing enemy crits and saw slashes."
    },
    {
      id: "bot_abil_06", num: 6, code: "BOT-ABIL-06", name: "Gyroscopic Instant-180 Pivot Flywheel",
      cost: 280, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/bot_abil_06.jpg",
      stats: { power: 4, speed: 6, agility: 20, hp: 25 },
      effect: "PASSIVE: +55% Turn Rate; immediately whips your front armor around to face rear attackers.",
      whatItDoes: "An internal high-speed momentum flywheel lets your bot snap 180 degrees in a fraction of a second, preventing enemies from backstabbing you."
    },
    {
      id: "bot_abil_07", num: 7, code: "BOT-ABIL-07", name: "Cryo-Coolant Overclock Radiator Core",
      cost: 310, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/bot_abil_07.jpg",
      stats: { power: 8, speed: 10, agility: 12, hp: 35 },
      effect: "PASSIVE: Reduces all Bull-Charge and Evasive Dash cooldowns by 35%.",
      whatItDoes: "Floods your drive motors with liquid nitrogen coolant so your bot can chain dashes and charges back-to-back without overheating."
    },
    {
      id: "bot_abil_08", num: 8, code: "BOT-ABIL-08", name: "Holo-Decoy Afterimage Projector",
      cost: 340, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/bot_abil_08.jpg",
      stats: { power: 2, speed: 14, agility: 18, hp: 30 },
      effect: "ACTIVE (3.5s CD): Projects a hologram decoy during dodges, causing enemy charges to miss by 40°.",
      whatItDoes: "Scrambles enemy targeting sensors with a glowing holographic duplicate whenever you execute an evasive dash."
    },
    {
      id: "bot_abil_09", num: 9, code: "BOT-ABIL-09", name: "Emergency Self-Repair Nano-Welder Rig",
      cost: 370, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/bot_abil_09.jpg",
      stats: { power: 6, speed: 2, agility: 4, hp: 110 },
      effect: "PASSIVE: Regenerates +14 HP per second throughout the battle (+700 HP over a full 50s match!).",
      whatItDoes: "Automated micro-welding arms continuously patch dented armor plates and restore structural Hit Points mid-combat."
    },
    {
      id: "bot_abil_10", num: 10, code: "BOT-ABIL-10", name: "Heavy Gravity-Mass Ballast Drop-Clamp",
      cost: 400, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/bot_abil_10.jpg",
      stats: { power: 24, speed: -2, agility: 2, hp: 90 },
      effect: "PASSIVE: Increases effective collision mass by +50%, winning every head-on shove contest.",
      whatItDoes: "Lowers a depleted-uranium ballast core to millimeter floor clearance, turning head-on collisions into one-sided knockbacks."
    },
    {
      id: "bot_abil_11", num: 11, code: "BOT-ABIL-11", name: "EMP Stun-Wave Capacitor Coil",
      cost: 440, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/bot_abil_11.jpg",
      stats: { power: 14, speed: 6, agility: 12, hp: 45 },
      effect: "ACTIVE (4.5s CD): Emits an electromagnetic pulse on impact that locks enemy steering for 1.2s.",
      whatItDoes: "Short-circuits the opponent's drive servos on clash, leaving them temporarily paralyzed right next to the Center Saw."
    },
    {
      id: "bot_abil_12", num: 12, code: "BOT-ABIL-12", name: "Hydraulic Jump-Jet Leap Thrusters",
      cost: 480, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/bot_abil_12.jpg",
      stats: { power: 10, speed: 18, agility: 18, hp: 40 },
      effect: "ACTIVE: Allows your bot to boost-vault cleanly over the Center Saw without taking shred damage!",
      whatItDoes: "Fires downward thrusters when crossing the middle trench, reducing Center Saw collision damage by 75%."
    },
    {
      id: "bot_abil_13", num: 13, code: "BOT-ABIL-13", name: "Tesla Arc-Shield Perimeter Barrier",
      cost: 520, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/bot_abil_13.jpg",
      stats: { power: 18, speed: 6, agility: 8, hp: 80 },
      effect: "PASSIVE: Zaps any enemy within close range for +20 Lightning Damage and reduces incoming damage by 20%.",
      whatItDoes: "Surrounds your MASS-17 hull with a crackling high-voltage plasma cage that damages enemies every time they touch you."
    },
    {
      id: "bot_abil_14", num: 14, code: "BOT-ABIL-14", name: "Overdrive Twin-Turbine Speed Booster",
      cost: 560, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/bot_abil_14.jpg",
      stats: { power: 10, speed: 28, agility: 14, hp: 35 },
      effect: "PASSIVE: +40% Top Velocity & +30% Acceleration across the entire arena.",
      whatItDoes: "Twin jet-turbine air intakes supercharge your drivetrain, making your bot the fastest interceptor in the pit."
    },
    {
      id: "bot_abil_15", num: 15, code: "BOT-ABIL-15", name: "Kinetic Energy Absorption Battery Bank",
      cost: 600, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/bot_abil_15.jpg",
      stats: { power: 22, speed: 8, agility: 8, hp: 95 },
      effect: "REACTIVE: Absorbs 35% of damage taken and adds it directly to your next ram attack!",
      whatItDoes: "Piezoelectric armor capacitors store the kinetic energy of enemy hits and discharge it into your next counter-strike."
    },
    {
      id: "bot_abil_16", num: 16, code: "BOT-ABIL-16", name: "Smoke & Spark Chaff Countermeasure Vent",
      cost: 640, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/bot_abil_16.jpg",
      stats: { power: 8, speed: 14, agility: 24, hp: 50 },
      effect: "REACTIVE: Deploys blinding thermite chaff when dodging, granting +40% Flank/Rear counter-crit chance.",
      whatItDoes: "Blinds the enemy's targeting sensors with hot magnesium sparks as you sidestep, setting up an immediate rear backstab."
    },
    {
      id: "bot_abil_17", num: 17, code: "BOT-ABIL-17", name: "Grapple-Tether Winch Pull Module",
      cost: 690, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/bot_abil_17.jpg",
      stats: { power: 28, speed: 10, agility: 12, hp: 65 },
      effect: "ACTIVE: Yanks fleeing opponents back into melee range and pulls them across the Center Saw slot.",
      whatItDoes: "Fires a high-tensile steel winch cable that reels in retreating bots and drags them through the middle hazard zone."
    },
    {
      id: "bot_abil_18", num: 18, code: "BOT-ABIL-18", name: "Diamond-Hardened Juggernaut Frame Lock",
      cost: 750, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/bot_abil_18.jpg",
      stats: { power: 26, speed: 4, agility: 6, hp: 165 },
      effect: "PASSIVE: +165 Max HP, +30% Armor Mitigation, and complete immunity to knock-stun!",
      whatItDoes: "Reinforces your internal chassis with synthetic diamond-titanium crossbeams that refuse to buckle under any impact."
    },
    {
      id: "bot_abil_19", num: 19, code: "BOT-ABIL-19", name: "Predictive AI Laser-Radar Hazard Scanner",
      cost: 820, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/bot_abil_19.jpg",
      stats: { power: 12, speed: 18, agility: 30, hp: 60 },
      effect: "PASSIVE: Doubles Center Saw detection range & automatically aligns attacks to herd foes into the blade!",
      whatItDoes: "360-degree LiDAR turret calculates saw trajectories 1.0s ahead, guaranteeing perfect saw-evasion and lethal enemy herding."
    },
    {
      id: "bot_abil_20", num: 20, code: "BOT-ABIL-20", name: "24K Gold Apex Reactor Berserk Core",
      cost: 950, tier: "Tier 5 (Apex)",
      img: "assets/concept_gallery/addons_80/bot_abil_20.jpg",
      stats: { power: 32, speed: 26, agility: 26, hp: 150 },
      effect: "APEX CORE: +35% All Combat Stats, +18 HP/s Regen, and triggers Overdrive Mode below 50% HP!",
      whatItDoes: "The pinnacle of Shibuya Bot-Pit reactor tech—boosts Power, Speed, Agility, and HP while unleashing relentless Berserk charges."
    }
  ],

  // --------------------------------------------------------------------------
  // TYPE 4: WEAPON ABILITIES (1 Slot — 20 Concept Pieces)
  // --------------------------------------------------------------------------
  weaponAbilities: [
    {
      id: "wpn_abil_01", num: 1, code: "WPN-ABIL-01", name: "White-Hot Induction Thermal Blade Heater",
      cost: 140, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/wpn_abil_01.jpg",
      stats: { power: 12, speed: 0, agility: 2, hp: 10 },
      effect: "Heats your equipped weapons to 1,200°C, adding +18 Thermal Burn Damage on every strike.",
      whatItDoes: "Coils high-frequency induction heaters around your weapons so every melee clash sears through enemy armor plating."
    },
    {
      id: "wpn_abil_02", num: 2, code: "WPN-ABIL-02", name: "Hyper-RPM Planetary Gearbox Overclock",
      cost: 170, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/wpn_abil_02.jpg",
      stats: { power: 15, speed: 4, agility: 4, hp: 15 },
      effect: "Doubles rotary weapon spin-up speed and increases weapon strike damage by +22%.",
      whatItDoes: "Replaces standard weapon drive gears with a 3-stage planetary overdrive that keeps saws and spinners at peak lethal RPM."
    },
    {
      id: "wpn_abil_03", num: 3, code: "WPN-ABIL-03", name: "Seismic Shockwave Impact Amplifier",
      cost: 200, tier: "Tier 1",
      img: "assets/concept_gallery/addons_80/wpn_abil_03.jpg",
      stats: { power: 18, speed: 0, agility: 2, hp: 25 },
      effect: "+35% Weapon Knockback Distance & adds a 0.5s concussive tremor stun on heavy hits.",
      whatItDoes: "Releases a compressed seismic shock-pulse through your front weapons on impact, blasting opponents across the arena."
    },
    {
      id: "wpn_abil_04", num: 4, code: "WPN-ABIL-04", name: "High-Voltage Arc-Welder Weapon Charger",
      cost: 240, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/wpn_abil_04.jpg",
      stats: { power: 16, speed: 4, agility: 6, hp: 20 },
      effect: "Electrifies your weapons with 50,000V: +24 Shock Damage & briefly slows enemy turn rate by 40%.",
      whatItDoes: "Channels high-amperage welding current through your weapon tips, discharging blinding blue-gold lightning arcs on contact."
    },
    {
      id: "wpn_abil_05", num: 5, code: "WPN-ABIL-05", name: "Ultrasonic Armor-Shredding Vibro-Core",
      cost: 270, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/wpn_abil_05.jpg",
      stats: { power: 20, speed: 2, agility: 6, hp: 20 },
      effect: "Vibrates weapon edges at 40 kHz, ignoring 45% of enemy Defense Rating and Front Guard!",
      whatItDoes: "Turns any melee weapon into an ultrasonic vibro-blade that slices effortlessly through heavily armored tank bots."
    },
    {
      id: "wpn_abil_06", num: 6, code: "WPN-ABIL-06", name: "Pneumatic Knockback Mega-Piston Booster",
      cost: 300, tier: "Tier 2",
      img: "assets/concept_gallery/addons_80/wpn_abil_06.jpg",
      stats: { power: 24, speed: 2, agility: 0, hp: 30 },
      effect: "+60% Weapon Shove Impulse toward the Center Saw trench!",
      whatItDoes: "Supercharges your weapon mounts with secondary pneumatic accumulators designed specifically to launch rivals into the middle saw."
    },
    {
      id: "wpn_abil_07", num: 7, code: "WPN-ABIL-07", name: "Molten Thermite Spark-Shower Injector",
      cost: 340, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/wpn_abil_07.jpg",
      stats: { power: 26, speed: 4, agility: 4, hp: 25 },
      effect: "Ignites thermite on weapon contact, dealing +32 Immediate Burn Damage + 10 DoT over 2s.",
      whatItDoes: "Sprays burning aluminum-iron thermite across the enemy chassis upon collision, melting through their hit points."
    },
    {
      id: "wpn_abil_08", num: 8, code: "WPN-ABIL-08", name: "Armor-Piercing Tungsten-Carbide Tip Infuser",
      cost: 380, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/wpn_abil_08.jpg",
      stats: { power: 28, speed: 2, agility: 4, hp: 30 },
      effect: "+30 Base Strike Damage & +25% bonus damage on head-on clashes.",
      whatItDoes: "Reinforces every tooth and edge of your weapons with industrial tungsten-carbide inserts that never dull."
    },
    {
      id: "wpn_abil_09", num: 9, code: "WPN-ABIL-09", name: "Magnetic Target-Pull Weapon Attractor",
      cost: 420, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/wpn_abil_09.jpg",
      stats: { power: 22, speed: 6, agility: 12, hp: 35 },
      effect: "Magnetically pulls nearby enemies into your weapon hitbox from 45px away!",
      whatItDoes: "Projects a focused magnetic cone ahead of your weapons so even narrow dodges get sucked into your strike zone."
    },
    {
      id: "wpn_abil_10", num: 10, code: "WPN-ABIL-10", name: "Ricochet-Dampening Recoil Stabilizer Gyro",
      cost: 450, tier: "Tier 3",
      img: "assets/concept_gallery/addons_80/wpn_abil_10.jpg",
      stats: { power: 20, speed: 10, agility: 14, hp: 40 },
      effect: "Eliminates self-recoil on weapon hits and allows immediate follow-up strikes (-30% Clash CD).",
      whatItDoes: "Counter-weights your weapon assembly so your bot maintains 100% forward momentum after slamming an opponent."
    },
    {
      id: "wpn_abil_11", num: 11, code: "WPN-ABIL-11", name: "Cryo-Brittle Freezing Edge Infuser",
      cost: 490, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/wpn_abil_11.jpg",
      stats: { power: 26, speed: 8, agility: 10, hp: 35 },
      effect: "Super-cools weapons to -196°C: chills enemy hulls on hit, reducing their Speed & Defense by 30%!",
      whatItDoes: "Liquid-nitrogen channels freeze enemy steel on contact, making their armor brittle and slowing their escape from the saw."
    },
    {
      id: "wpn_abil_12", num: 12, code: "WPN-ABIL-12", name: "Blood-Crimson Critical Backstab Multiplier Core",
      cost: 530, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/wpn_abil_12.jpg",
      stats: { power: 28, speed: 10, agility: 18, hp: 30 },
      effect: "Increases Flank Crit Multiplier to 1.85x and Rear Crit Multiplier to 2.50x!",
      whatItDoes: "Calibrates weapon strike geometry to exploit weak side and rear seams for massive one-hit critical bursts."
    },
    {
      id: "wpn_abil_13", num: 13, code: "WPN-ABIL-13", name: "Chain-Lightning Overload Weapon Capacitor",
      cost: 570, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/wpn_abil_13.jpg",
      stats: { power: 34, speed: 8, agility: 8, hp: 40 },
      effect: "Unleashes a +42 Damage high-voltage plasma burst on every Bull-Charge or Flank hit.",
      whatItDoes: "Stores megajoules of electrical energy and discharges a deafening thunderclap through your weapons on impact."
    },
    {
      id: "wpn_abil_14", num: 14, code: "WPN-ABIL-14", name: "Hydraulic Crush-Pressure Doubler Pump",
      cost: 620, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/wpn_abil_14.jpg",
      stats: { power: 38, speed: 4, agility: 6, hp: 50 },
      effect: "+45% Raw Weapon Damage & +40% Shove Force across all equipped weapons.",
      whatItDoes: "Twin 10,000-psi hydraulic intensifier pumps double the clamping and striking force of your entire weapon bay."
    },
    {
      id: "wpn_abil_15", num: 15, code: "WPN-ABIL-15", name: "Explosive Contact-Detonator Ram Plate",
      cost: 670, tier: "Tier 4",
      img: "assets/concept_gallery/addons_80/wpn_abil_15.jpg",
      stats: { power: 44, speed: 6, agility: 4, hp: 45 },
      effect: "Detonates shaped kinetic charges on impact for +54 Blast Damage and massive knockback!",
      whatItDoes: "Lines your weapon striking face with reloadable shaped-charge capsules that detonate outward when you ram the enemy."
    },
    {
      id: "wpn_abil_16", num: 16, code: "WPN-ABIL-16", name: "Vortex Vacuum Blade Spin-Up Turbine",
      cost: 720, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/wpn_abil_16.jpg",
      stats: { power: 36, speed: 14, agility: 16, hp: 45 },
      effect: "Creates a low-pressure vortex ahead of your weapons that sucks enemies in and boosts strike damage by +38%.",
      whatItDoes: "Uses weapon rotation to generate an aerodynamic suction funnel that destabilizes and pulls rivals into your blades."
    },
    {
      id: "wpn_abil_17", num: 17, code: "WPN-ABIL-17", name: "Corrosive Acid-Etch Blade Coating Injector",
      cost: 770, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/wpn_abil_17.jpg",
      stats: { power: 40, speed: 8, agility: 10, hp: 40 },
      effect: "Coats weapons in industrial fluoroantimonic acid: +46 Damage & permanently melts 25% of enemy Armor!",
      whatItDoes: "Every weapon strike dissolves the opponent's protective plating, making each subsequent hit deal progressively more damage."
    },
    {
      id: "wpn_abil_18", num: 18, code: "WPN-ABIL-18", name: "Momentum-Transfer Kinetic Siphon Core",
      cost: 830, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/wpn_abil_18.jpg",
      stats: { power: 42, speed: 14, agility: 14, hp: 60 },
      effect: "Steals 30% of the enemy's velocity on hit AND heals your bot for 25% of weapon damage dealt!",
      whatItDoes: "Converts the kinetic energy of your weapon strikes into instant structural repair and a burst of speed."
    },
    {
      id: "wpn_abil_19", num: 19, code: "WPN-ABIL-19", name: "Dual-Stage Afterburner Ramming Thruster",
      cost: 890, tier: "Tier 5",
      img: "assets/concept_gallery/addons_80/wpn_abil_19.jpg",
      stats: { power: 48, speed: 20, agility: 10, hp: 55 },
      effect: "Fires a secondary rocket pulse 0.1s before weapon impact: +60% Velocity Damage & +65% Knockback!",
      whatItDoes: "Ignites solid-fuel micro-rockets on the back of your weapon arms right before collision for unstoppable ramming power."
    },
    {
      id: "wpn_abil_20", num: 20, code: "WPN-ABIL-20", name: "24K Gold God-Forge Omega Weapon Overdrive",
      cost: 1000, tier: "Tier 5 (Apex)",
      img: "assets/concept_gallery/addons_80/wpn_abil_20.jpg",
      stats: { power: 60, speed: 18, agility: 18, hp: 90 },
      effect: "OMEGA AUGMENT: +65 Weapon Damage, 50% Armor Penetration, +55% Saw-Herd Knockback, and Thermal-Lightning Crits!",
      whatItDoes: "The ultimate weapon ability overdrive—combines white-hot induction heat, high-voltage plasma arcs, and ultrasonic armor penetration."
    }
  ]
};

// ============================================================================
// TOP 20 DYNAMIC PICKS (5 OF EACH TYPE FOR MAXIMUM GAMEPLAY VARIETY & COUNTER-PLAY)
// ============================================================================
window.DYNAMIC_20_IDS = {
  tires: ["tire_04", "tire_05", "tire_12", "tire_15", "tire_17"],
  weapons: ["wpn_01", "wpn_05", "wpn_08", "wpn_10", "wpn_12"],
  rangedWeapons: ["rng_01", "rng_04", "rng_08", "rng_13", "rng_18"],
  botAbilities: ["bot_abil_01", "bot_abil_04", "bot_abil_09", "bot_abil_11", "bot_abil_17"],
  weaponAbilities: ["wpn_abil_03", "wpn_abil_07", "wpn_abil_11", "wpn_abil_12", "wpn_abil_18"]
};

window.DYNAMIC_PICK_META = {
  // 5 Dynamic Tires
  tire_04: { role: "90° Strafe & Saw-Dodge", whyDynamic: "Strafes sideways out of the Center Saw lane while keeping front armor locked on the enemy." },
  tire_05: { role: "Bulldozer Saw-Herder", whyDynamic: "+35% Shove Force & 40% Knockback Resist—turns your bot into an unstoppable tank that pushes rivals into the saw." },
  tire_12: { role: "J-Turn Powerslide Flanker", whyDynamic: "Whips around oncoming enemy Bull-Charges at 95% speed to line up instant Rear Backstab crits." },
  tire_15: { role: "Hyper-Sprint Interceptor", whyDynamic: "+35% straight-line velocity and -25% dodge cooldown for lightning-fast gap closing and saw escapes." },
  tire_17: { role: "Drive-By Wheel Slasher", whyDynamic: "Spinning chariot hub blades automatically slice enemies for +26 damage whenever you sideswipe or orbit near them." },

  // 5 Dynamic Weapons
  wpn_01: { role: "Scoop & Saw-Herd Wedge", whyDynamic: "Deflects 25% of head-on damage and angles enemy knockback +45% harder toward the active Center Saw." },
  wpn_05: { role: "Airborne Flipper & Stun", whyDynamic: "Hurls enemies across the arena (+50% toss distance) and inflicts a 0.8s FLIPPED STUN on landing." },
  wpn_08: { role: "50% Armor-Piercing Drill", whyDynamic: "Punches straight through high-Defense tank builds by ignoring 50% of enemy Armor and Front Guard." },
  wpn_10: { role: "Clamp & Drag Grappler", whyDynamic: "Clamps onto enemy hulls for 0.75s on impact so you can physically drag and release them into the Center Saw." },
  wpn_12: { role: "360° Anti-Flank Ring Spinner", whyDynamic: "Revolving full-body toothed ring completely negates enemy Flank/Rear crits and shreds anyone who touches you." },

  // 5 Dynamic Long-Range Weapons (Weapon Upgrade 2)
  rng_01: { role: "🎯 Gauss Railgun Sniper", whyDynamic: "Fires hyper-velocity tungsten rail-slugs across the arena every 1.7s for +54 AP damage & saw-knockback!" },
  rng_04: { role: "🚀 Homing Missile Swarm", whyDynamic: "Launches 3 curving homing micro-missiles every 2.2s that track dodging enemies for 3x 24 explosive blast damage!" },
  rng_08: { role: "⚙️ Ricochet Saw-Launcher", whyDynamic: "Rapid-fires spinning titanium saw-discs every 0.95s that bounce off arena walls up to 2 times (+36 slash damage)!" },
  rng_13: { role: "☄️ Plasma Siege Mortar", whyDynamic: "Lobs arcing superheated plasma shells over front shields for +50 blast damage and 3.0s molten burn DoT!" },
  rng_18: { role: "⚡ Lock-On Laser Obliterator", whyDynamic: "Projects a continuous crimson-violet lock-on beam across the arena for +66 damage and -35% turn slow!" },

  // 5 Dynamic Bot Abilities
  bot_abil_01: { role: "Active 90° Jet-Sidestep", whyDynamic: "Fires compressed-gas side thrusters (2.5s CD) to blast 90° out of enemy charges and saw passes." },
  bot_abil_04: { role: "360° Repulsor Shockwave", whyDynamic: "Emits an expanding radial kinetic dome (4.0s CD) when flanked, blasting nearby enemies toward the middle trench." },
  bot_abil_09: { role: "+16 HP/s Nano-Welder Regen", whyDynamic: "Continuously welds damaged armor mid-fight (+16 HP/sec with green repair pulses), winning war-of-attrition brawls." },
  bot_abil_11: { role: "Paralyzing EMP Stun-Wave", whyDynamic: "Discharges an electric EMP ring (4.5s CD) on clash that locks enemy steering for 1.2s right next to the saw." },
  bot_abil_17: { role: "Steel Winch Scorpion-Pull", whyDynamic: "Fires a high-tensile winch cable (4.5s CD) that yanks enemies across the spinning Center Saw blade!" },

  // 5 Dynamic Weapon Abilities
  wpn_abil_03: { role: "Seismic Mega-Knockback", whyDynamic: "Releases a concussive ground tremor on weapon hits for +40% knockback distance and a 0.5s stun." },
  wpn_abil_07: { role: "Molten Thermite Burn DoT", whyDynamic: "Ignites enemy plating on contact for 4.0s of continuous melting fire damage-over-time and spark trails." },
  wpn_abil_11: { role: "Cryo-Freeze Slow & Brittle", whyDynamic: "Chills enemies for 3.0s (-35% speed/turn & +25% brittle damage taken) so they cannot outrun the Center Saw." },
  wpn_abil_12: { role: "2.5x Rear Backstab Executioner", whyDynamic: "Boosts Flank Crits to 1.85x and Rear Backstabs to 2.50x for massive assassin burst damage." },
  wpn_abil_18: { role: "30% Vampiric Life-Siphon", whyDynamic: "Heals your bot for 30% of all weapon damage dealt AND steals 30% of the enemy's speed on impact." }
};

for (const [catKey, list] of Object.entries(window.BOT_ADDONS_CATALOG)) {
  const pickIds = window.DYNAMIC_20_IDS[catKey] || [];
  for (const item of list) {
    if (pickIds.includes(item.id)) {
      item.isDynamicPick = true;
      item.dynamicRole = window.DYNAMIC_PICK_META[item.id]?.role || "Dynamic Pick";
      item.whyDynamic = window.DYNAMIC_PICK_META[item.id]?.whyDynamic || item.whatItDoes;
    } else {
      item.isDynamicPick = false;
    }
  }
}

// ============================================================================
// MAP 01 (GOLD FURNACE SAW PIT) — 10-LEVEL CAMPAIGN & ENEMY ROSTER
// ============================================================================
window.MAP1_LEVELS = [
  {
    level: 1,
    name: "ROOKIE UNIT-17",
    title: "Lv.1 Standard Issue Twin",
    color: "#ff2a55",
    reward: 150,
    baseStats: { power: 50, speed: 50, agility: 50, hp: 750 },
    loadout: { tire: null, wpn1: null, wpn2: null, botAbil1: null, botAbil2: null, wpnAbil: null },
    desc: "Unmodified MASS-17 factory rig with identical 50/50/50 baseline stats."
  },
  {
    level: 2,
    name: "DOZER-HERDER",
    title: "Lv.2 Tracked Wedge Pusher",
    color: "#38bdf8",
    reward: 200,
    baseStats: { power: 52, speed: 50, agility: 50, hp: 760 },
    loadout: { tire: "tire_05", wpn1: "wpn_01", wpn2: null, botAbil1: null, botAbil2: null, wpnAbil: null },
    desc: "Uses Caterpillar Tank Tracks + Bulldozer Wedge Plow to shove you straight toward the Center Saw."
  },
  {
    level: 3,
    name: "DRIFT-VIPER",
    title: "Lv.3 J-Turn Flank Slicer",
    color: "#f472b6",
    reward: 260,
    baseStats: { power: 52, speed: 54, agility: 54, hp: 780 },
    loadout: { tire: "tire_12", wpn1: "wpn_08", wpn2: null, botAbil1: "bot_abil_01", botAbil2: null, wpnAbil: null },
    desc: "Powerslides behind your charges with Drift-Teflon Skid Wheels, Sidestep Jets, and an Armor-Piercing Drill."
  },
  {
    level: 4,
    name: "CLAW-DRAGGER",
    title: "Lv.4 Backhoe Saw-Trapper",
    color: "#fb923c",
    reward: 330,
    baseStats: { power: 56, speed: 50, agility: 52, hp: 820 },
    loadout: { tire: "tire_04", wpn1: "wpn_10", wpn2: "rng_01", botAbil1: "bot_abil_04", botAbil2: null, wpnAbil: null },
    desc: "Mecanum Strafe Rollers + Backhoe Grappler Claw & Repulsor Dome. Clamps and drags you into the saw!"
  },
  {
    level: 5,
    name: "VOLT-FLIPPER",
    title: "Lv.5 Mid-Boss EMP Launcher",
    color: "#a855f7",
    reward: 420,
    isBoss: true,
    baseStats: { power: 58, speed: 56, agility: 58, hp: 860 },
    loadout: { tire: "tire_15", wpn1: "wpn_05", wpn2: "rng_04", botAbil1: "bot_abil_11", botAbil2: null, wpnAbil: "wpn_abil_03" },
    desc: "Map 1 Mid-Boss! Carbon Sprint Wheels, Pneumatic Flipper Ramp, EMP Stun-Wave Coil & Seismic Shockwave."
  },
  {
    level: 6,
    name: "CRYO-AUGER",
    title: "Lv.6 Sub-Zero Tank Buster",
    color: "#00f5ff",
    reward: 500,
    baseStats: { power: 60, speed: 58, agility: 60, hp: 900 },
    loadout: { tire: "tire_04", wpn1: "wpn_08", wpn2: "rng_08", botAbil1: "bot_abil_01", botAbil2: "bot_abil_09", wpnAbil: "wpn_abil_11" },
    desc: "Chills your drive motors with Cryo-Brittle Freezing Edge (-35% Speed) while regenerating with Nano-Welders."
  },
  {
    level: 7,
    name: "SCORPION-WINCH",
    title: "Lv.7 Tether Saw-Puller",
    color: "#eab308",
    reward: 600,
    baseStats: { power: 64, speed: 58, agility: 60, hp: 950 },
    loadout: { tire: "tire_05", wpn1: "wpn_10", wpn2: "rng_13", botAbil1: "bot_abil_17", botAbil2: "bot_abil_11", wpnAbil: "wpn_abil_07" },
    desc: "Fires a Grapple-Tether Winch Cable across the active Center Saw to yank you through the blade + Thermite Burn!"
  },
  {
    level: 8,
    name: "CRIMSON-PHANTOM",
    title: "Lv.8 2.5x Backstab Assassin",
    color: "#ef4444",
    reward: 720,
    baseStats: { power: 66, speed: 66, agility: 66, hp: 1000 },
    loadout: { tire: "tire_17", wpn1: "wpn_05", wpn2: "rng_18", botAbil1: "bot_abil_01", botAbil2: "bot_abil_04", wpnAbil: "wpn_abil_12" },
    desc: "Razor-Flange Hubcap Slasher Wheels + Sidestep Jets + 2.50x Blood-Crimson Backstab Multiplier Core."
  },
  {
    level: 9,
    name: "VAMPIRIC-RING",
    title: "Lv.9 360° Siphon Fortress",
    color: "#10b981",
    reward: 860,
    baseStats: { power: 70, speed: 66, agility: 68, hp: 1080 },
    loadout: { tire: "tire_17", wpn1: "wpn_12", wpn2: "rng_18", botAbil1: "bot_abil_09", botAbil2: "bot_abil_04", wpnAbil: "wpn_abil_18" },
    desc: "Full-Body 360° Ring Spinner (negates flank crits) + Nano-Welder Regen + 30% Vampiric Kinetic Siphon."
  },
  {
    level: 10,
    name: "APEX-EXECUTIONER",
    title: "Lv.10 Map 1 Grand Boss",
    color: "#ffd700",
    reward: 1200,
    isBoss: true,
    baseStats: { power: 76, speed: 72, agility: 74, hp: 1220 },
    loadout: { tire: "tire_05", wpn1: "wpn_12", wpn2: "rng_18", botAbil1: "bot_abil_17", botAbil2: "bot_abil_11", wpnAbil: "wpn_abil_07" },
    desc: "Map 1 Final Boss! Combines 360° Ring Spinner, Grappler Claw, Winch Tether Pull, EMP Stun-Wave & Molten Thermite!"
  }
];

// ============================================================================
// ONLINE PVP ARENA — PLAYER CHALLENGER ROSTER (SAME 50/50/50 BASE MASS-17 RIG,
// DIFFERENTIATED BY PLAYER UPGRADES & TACTICAL LOADOUTS)
// ============================================================================
window.PVP_CHALLENGERS = [
  {
    id: "pvp_01",
    callsign: "@ScrapRookie_08",
    rankTitle: "Bronze Scrapper",
    elo: 980,
    wins: 6,
    losses: 5,
    bounty: 220,
    color: "#38bdf8",
    baseStats: { power: 50, speed: 50, agility: 50, hp: 750 },
    loadout: { tire: "tire_04", wpn1: "wpn_01", wpn2: null, botAbil1: "bot_abil_01", botAbil2: null, wpnAbil: null },
    bio: "Budget 3-slot starter build using Mecanum Rollers, Wedge Plow, and Lateral Thruster Jets to dodge the saw."
  },
  {
    id: "pvp_02",
    callsign: "@KuroDrift_99",
    rankTitle: "Silver Flank Assassin",
    elo: 1140,
    wins: 19,
    losses: 9,
    bounty: 320,
    color: "#f472b6",
    baseStats: { power: 50, speed: 50, agility: 50, hp: 750 },
    loadout: { tire: "tire_12", wpn1: "wpn_08", wpn2: "rng_08", botAbil1: "bot_abil_01", botAbil2: null, wpnAbil: "wpn_abil_12" },
    bio: "J-Turn Teflon Drifter who slides behind your charge for 2.5x Backstab Crits and pierces 50% armor with the Auger Drill."
  },
  {
    id: "pvp_03",
    callsign: "@IronBulldozer",
    rankTitle: "Gold Saw-Herder",
    elo: 1290,
    wins: 34,
    losses: 14,
    bounty: 420,
    color: "#fb923c",
    baseStats: { power: 50, speed: 50, agility: 50, hp: 750 },
    loadout: { tire: "tire_05", wpn1: "wpn_01", wpn2: "rng_04", botAbil1: "bot_abil_04", botAbil2: "bot_abil_17", wpnAbil: "wpn_abil_03" },
    bio: "Heavy Tank Tracks + Backhoe Claw + Winch Tether. Clamps your bot and drags you straight into the active Center Saw!"
  },
  {
    id: "pvp_04",
    callsign: "@SubZero_Volt",
    rankTitle: "Platinum Control Trapper",
    elo: 1460,
    wins: 51,
    losses: 18,
    bounty: 540,
    color: "#00f5ff",
    baseStats: { power: 50, speed: 50, agility: 50, hp: 750 },
    loadout: { tire: "tire_04", wpn1: "wpn_05", wpn2: "wpn_10", botAbil1: "bot_abil_11", botAbil2: "bot_abil_09", wpnAbil: "wpn_abil_11" },
    bio: "Locks your steering with EMP Stun-Wave + Cryo-Frost Slow right beside the saw while healing with Nano-Welders."
  },
  {
    id: "pvp_05",
    callsign: "@ShibuyaKing_X",
    rankTitle: "Apex Champion",
    elo: 1680,
    wins: 88,
    losses: 12,
    bounty: 750,
    color: "#ffd700",
    baseStats: { power: 50, speed: 50, agility: 50, hp: 750 },
    loadout: { tire: "tire_17", wpn1: "wpn_12", wpn2: "rng_08", botAbil1: "bot_abil_09", botAbil2: "bot_abil_04", wpnAbil: "wpn_abil_18" },
    bio: "Full 6-Slot Vampiric Ring Spinner build! Immune to flank crits, slashes on sideswipes, and heals 30% of all weapon damage dealt."
  }
];



// ============================================================================
// STRENGTHS & WEAKNESSES BALANCING FOR ALL 100 ATTACHMENTS (5 SLOTS x 20)
// Every attachment grants distinct Strengths (+Stats / Perks) AND Weaknesses (-Stats / Tradeoffs)
// ============================================================================
window.ATTACHMENT_BALANCE_OVERRIDES = {
  // --- TIRES (Slot 1) ---
  tire_04: {
    stats: { agility: 22, speed: 8, hp: -45, power: -8 },
    strength: "+35% Turn Rate & 90° lateral strafe out of the Center Saw lane.",
    weakness: "Delicate roller bearings (-45 HP & -20% Shove Force in head-on pushes)."
  },
  tire_05: {
    stats: { hp: 95, power: 22, speed: -14, agility: -12 },
    strength: "+45% Bulldozer Shove Force & -40% Incoming Knockback.",
    weakness: "Heavy tank treads reduce Speed (-14) & Turn Rate (-12), exposing your rear."
  },
  tire_12: {
    stats: { agility: 20, speed: 16, hp: -40, power: -10 },
    strength: "J-Turn Powerslide Flanks around enemy charges at 95% speed.",
    weakness: "Low-friction teflon rings take +30% extra knockback when rammed (-10 PWR, -40 HP)."
  },
  tire_15: {
    stats: { speed: 26, agility: 12, hp: -70, power: -12 },
    strength: "+35% Sprint Top Speed & -25% Dodge Cooldown for rapid escapes.",
    weakness: "Ultralight carbon rims (-70 Max HP & easily shoved toward the Center Saw)."
  },
  tire_17: {
    stats: { power: 18, speed: 10, hp: -40, agility: -8 },
    strength: "Spinning hub blades deal +28 Slash Damage on side/drive-by passes.",
    weakness: "Wide exposed hubs reduce steering (-8 AGI, -40 HP) & take +15% Flank Damage."
  },

  // --- WEAPON 1: MELEE (Slot 2) ---
  wpn_01: {
    stats: { hp: 65, power: 16, speed: -8, agility: -10 },
    strength: "Blocks 30% Front Damage & herds enemies +45% harder toward the Center Saw.",
    weakness: "Heavy front plow slows turn rate (-10 AGI, -8 SPD) & deals -15% Flank/Rear damage."
  },
  wpn_05: {
    stats: { power: 20, agility: 10, hp: -45, speed: -8 },
    strength: "Pneumatic Flipper launches & stuns enemies for 0.7s (+45% toss knockback).",
    weakness: "2.7s recharge cooldown between flips & lighter front armor (-45 HP, -8 SPD)."
  },
  wpn_08: {
    stats: { power: 26, speed: 8, hp: -50, agility: -10 },
    strength: "Twin Auger Drills ignore 50% of enemy Armor & Front Guard shields.",
    weakness: "Narrow drill bit has weak knockback shove (-30% Push Force) & -50 Max HP."
  },
  wpn_10: {
    stats: { hp: 45, power: 16, speed: -12, agility: -8 },
    strength: "Hydraulic Claw clamps enemies for 0.9s and drags them into the Center Saw.",
    weakness: "Heavy hydraulic jaws slow movement (-12 SPD, -8 AGI) & deal -15% raw hit damage."
  },
  wpn_12: {
    stats: { power: 24, agility: 12, hp: -65, speed: -10 },
    strength: "360° Ring Spinner negates all Flank/Rear Crits & shreds nearby bots.",
    weakness: "Massive gyroscopic drain (-65 Max HP, -10 SPD) & strong self-recoil on clash."
  },

  // --- WEAPON 2: LONG RANGE (Slot 3) ---
  rng_01: {
    stats: { power: 24, agility: 8, hp: -45, speed: -8 },
    strength: "Fires hyper-velocity AP rail-slugs across the arena (+54 Armor-Piercing Damage).",
    weakness: "Slow 1.7s capacitor reload & fragile high-voltage coils (-45 Max HP, -8 SPD)."
  },
  rng_04: {
    stats: { power: 20, hp: 25, speed: -10, agility: -8 },
    strength: "Fires 3 homing micro-missiles that curve in flight (3x 24 Explosive Damage).",
    weakness: "Reduced damage vs. heavy Front Shields & heavy ammo rack (-10 SPD, -8 AGI)."
  },
  rng_08: {
    stats: { power: 18, agility: 12, hp: -35, speed: -6 },
    strength: "Rapid-fires bouncing saw-discs every 0.95s (ricochets 2x off arena walls).",
    weakness: "Low single-hit stopping power (zero knockback) & exposed ammo feed (-35 HP)."
  },
  rng_13: {
    stats: { power: 30, hp: 30, speed: -12, agility: -10 },
    strength: "Lobs arcing plasma shells (+50 Blast Damage + 3.0s Molten Burn DoT).",
    weakness: "Slow shell velocity (fast bots can dodge it) & heavy mortar frame (-12 SPD, -10 AGI)."
  },
  rng_18: {
    stats: { power: 28, agility: 10, hp: -55, speed: -8 },
    strength: "Instant lock-on beam deals +66 Continuous Damage & -35% Enemy Turn Slow.",
    weakness: "Drains reactor shielding (-55 Max HP, -8 SPD) & 2.5s cooldown between beams."
  },

  // --- BOT ABILITIES (Slots 4 & 5) ---
  bot_abil_01: {
    stats: { speed: 18, agility: 16, hp: -45, power: -8 },
    strength: "Fires 90° lateral thruster jets to dodge enemy charges and the Center Saw.",
    weakness: "Pressurized fuel tanks reduce hull integrity (-45 HP) & ramming weight (-8 PWR)."
  },
  bot_abil_04: {
    stats: { hp: 40, power: 14, speed: -10, agility: -8 },
    strength: "Emits a 360° Repulsor Shockwave every 3.1s that blasts flankers toward the Saw.",
    weakness: "Heavy emitter dome slows acceleration (-10 SPD, -8 AGI) & 3.1s cooldown."
  },
  bot_abil_09: {
    stats: { hp: 70, power: -14, speed: -8, agility: -6 },
    strength: "Autonomous Nano-Welder continuously repairs +28 HP/sec during combat.",
    weakness: "Diverts reactor power away from weapons (-14 PWR) and drive motors (-8 SPD)."
  },
  bot_abil_11: {
    stats: { power: 14, agility: 12, hp: -40, speed: -8 },
    strength: "EMP Stun-Wave paralyzes enemy steering & turrets for 1.6s within 245px.",
    weakness: "Long 3.5s capacitor recharge & fragile unshielded EMP coils (-40 HP, -8 SPD)."
  },
  bot_abil_17: {
    stats: { power: 18, hp: 30, speed: -10, agility: -10 },
    strength: "Fires a Steel Winch Harpoon that yanks enemies across the active Center Saw.",
    weakness: "Heavy winch drum slows speed/turning (-10 SPD, -10 AGI) & cannot fire inside 180px."
  },

  // --- WEAPON ABILITY / SPECIAL MOD (Slot 6) ---
  wpn_abil_03: {
    stats: { power: 22, hp: 20, speed: -10, agility: -10 },
    strength: "Seismic Tremor Core adds +40% Weapon Knockback Distance & impact stun.",
    weakness: "Heavy recoil slows recovery (-10 SPD, -10 AGI) & knocks foes out of melee range."
  },
  wpn_abil_07: {
    stats: { power: 26, hp: -40, speed: -6, agility: -6 },
    strength: "Molten Thermite ignites enemy armor for 4.5s of continuous melting fire DoT.",
    weakness: "Volatile fuel tank reduces own hull armor (-40 HP) & adds zero knockback."
  },
  wpn_abil_11: {
    stats: { power: 14, agility: 12, hp: -35, speed: -8 },
    strength: "Cryo-Freeze chills enemies (-35% Speed & +25% Brittle Damage taken for 3.6s).",
    weakness: "Heavy liquid-nitrogen tanks slow top speed (-8 SPD, -35 HP) & lower raw burst."
  },
  wpn_abil_12: {
    stats: { power: 28, agility: 14, hp: -55, speed: -6 },
    strength: "Executioner Core boosts Rear Backstabs to 2.5x Damage & Flank Crits to 1.85x.",
    weakness: "Glass-cannon calibration (-55 Max HP & -15% front-on clash damage)."
  },
  wpn_abil_18: {
    stats: { power: 18, speed: 10, hp: -50, agility: -8 },
    strength: "Vampiric Siphon heals your bot for 42% of all weapon damage dealt.",
    weakness: "Parasitic core drains -50 Starting Max HP — must deal damage to stay alive!"
  }
};

for (const [catKey, list] of Object.entries(window.BOT_ADDONS_CATALOG)) {
  for (const item of list) {
    const ov = window.ATTACHMENT_BALANCE_OVERRIDES[item.id];
    if (ov) {
      item.stats = { ...ov.stats };
      item.strength = ov.strength;
      item.weakness = ov.weakness;
    } else {
      // Ensure non-featured catalog items ALSO have real +Strengths and -Weaknesses!
      const s = item.stats || {};
      if (catKey === "tires") {
        if ((s.speed || 0) >= (s.power || 0)) {
          item.stats = { speed: Math.max(10, s.speed || 12), agility: Math.max(8, s.agility || 10), hp: -35, power: -8 };
          item.strength = item.effect || "Boosts high-speed mobility and cornering agility.";
          item.weakness = "Lightweight wheel assembly reduces Max HP (-35) and Shove Power (-8).";
        } else {
          item.stats = { hp: Math.max(45, s.hp || 50), power: Math.max(12, s.power || 14), speed: -10, agility: -8 };
          item.strength = item.effect || "Heavy-duty armored tread increases pushing force and hull stability.";
          item.weakness = "High rotational weight slows top speed (-10 SPD) and turning (-8 AGI).";
        }
      } else if (catKey === "weapons" || catKey === "rangedWeapons") {
        item.stats = { power: Math.max(16, s.power || 18), agility: s.agility > 8 ? 8 : -8, hp: -40, speed: -8 };
        item.strength = item.effect || "High-output offensive weapon system.";
        item.weakness = "Heavy weapon mount & reactor draw reduce hull armor (-40 HP) and speed (-8 SPD).";
      } else {
        item.stats = { power: Math.max(14, s.power || 16), hp: (s.hp || 0) > 40 ? 45 : -35, speed: -8, agility: -6 };
        item.strength = item.effect || "Specialized tactical module.";
        item.weakness = "Auxiliary power draw reduces movement speed (-8 SPD) and agility (-6 AGI).";
      }
    }
  }
}


// ============================================================================
// 5-TIER ITEM RARITY METADATA (FOR THE ORIGINAL 5 DYNAMIC ITEMS PER CATEGORY)
// ============================================================================
window.RARITY_TIERS = {
  COMMON:    { key: "COMMON",    label: "COMMON",    icon: "○", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.16)", border: "rgba(148, 163, 184, 0.45)", glow: "rgba(148, 163, 184, 0.15)" },
  UNCOMMON:  { key: "UNCOMMON",  label: "UNCOMMON",  icon: "●", color: "#34d399", bg: "rgba(16, 185, 129, 0.16)",  border: "rgba(52, 211, 153, 0.55)",  glow: "rgba(52, 211, 153, 0.22)" },
  RARE:      { key: "RARE",      label: "RARE",      icon: "▲", color: "#38bdf8", bg: "rgba(14, 165, 233, 0.18)",  border: "rgba(56, 189, 248, 0.60)",  glow: "rgba(56, 189, 248, 0.26)" },
  EPIC:      { key: "EPIC",      label: "EPIC",      icon: "◆", color: "#c084fc", bg: "rgba(168, 85, 247, 0.20)",  border: "rgba(192, 132, 252, 0.68)", glow: "rgba(192, 132, 252, 0.30)" },
  LEGENDARY: { key: "LEGENDARY", label: "LEGENDARY", icon: "★", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.22)",  border: "rgba(251, 191, 36, 0.80)",  glow: "rgba(251, 191, 36, 0.38)" }
};

for (const list of Object.values(window.BOT_ADDONS_CATALOG)) {
  for (const item of list) {
    if (!item.rarity) {
      const c = Number(item.cost) || 200;
      const t = String(item.tier || "");
      if (t.includes("Tier 5") || c >= 680) item.rarity = "LEGENDARY";
      else if (t.includes("Tier 4") || c >= 480) item.rarity = "EPIC";
      else if (t.includes("Tier 3") || c >= 320) item.rarity = "RARE";
      else if (t.includes("Tier 2") || c >= 200) item.rarity = "UNCOMMON";
      else item.rarity = "COMMON";
    }
    const rMeta = window.RARITY_TIERS[item.rarity] || window.RARITY_TIERS.COMMON;
    item.rarityColor = rMeta.color;
    item.rarityLabel = rMeta.label;
    item.rarityIcon  = rMeta.icon;
    item.cardImg = `assets/concept_gallery/addons_80/unique_cards/${item.id}.jpg`;
  }
}

window.BOTPIT_MAPS = [
  {
    id: "map_01_furnace",
    num: 1,
    arenaNum: 1,
    badge: "🔥 ARENA 01",
    category: "ORIGINAL ARENA",
    name: "SHIBUYA FURNACE PIT",
    shortName: "🔥 SHIBUYA PIT",
    subtitle: "Center Rip-Saw & 4 Corner Blast Furnaces",
    hazardDesc: "Classic underground octagon with the emerging Center Rip-Saw and 4 glowing corner blast furnaces.",
    conceptArt: "assets/concept_gallery/battlebots_topdown_3d/topdown_3d_arena_10.jpg",
    accent: "#fbbf24",
    themeColor: "#fbbf24",
    floorTint: "rgba(0, 0, 0, 0)",
    gridColor: "rgba(251, 191, 36, 0.10)",
    borderGlow: "#fbbf24",
    frictionMult: 1.0,
    wallBounceMult: 1.0,
    sawDmgMult: 1.0,
    hazardType: "furnace"
  },
  {
    id: "arena_02_lava_bridge",
    num: 2,
    arenaNum: 2,
    badge: "🌋 ARENA 02",
    category: "RING-OUT MAP",
    name: "OSAKA MOLTEN LAVA BRIDGE",
    shortName: "🌋 LAVA BRIDGE",
    subtitle: "RING-OUT: Open Top & Bottom Molten Lava Chasms",
    hazardDesc: "Wide horizontal riveted dark-steel bridge with NO top or bottom walls—shoving or flipping a rival across the yellow-and-black hazard stripes into the north/south lava rivers is an instant Ring-Out KO!",
    conceptArt: "assets/concept_gallery/battlebots_topdown_3d/maps_10/ringout_01_lava_bridge.jpg",
    accent: "#f97316",
    themeColor: "#f97316",
    floorTint: "rgba(0, 0, 0, 0)",
    gridColor: "rgba(249, 115, 22, 0.12)",
    borderGlow: "#f97316",
    frictionMult: 1.0,
    wallBounceMult: 1.15,
    sawDmgMult: 1.0,
    hazardType: "ringout_top_bottom"
  },
  {
    id: "arena_07_smelter_trenches",
    num: 7,
    arenaNum: 7,
    badge: "🔥 ARENA 07",
    category: "RING-OUT MAP",
    name: "KAWASAKI SMELTER SIDE-TRENCHES",
    shortName: "🔥 SIDE TRENCHES",
    subtitle: "RING-OUT: Open Left & Right Molten Slag Pouring Trenches",
    hazardDesc: "Solid armored walls on Top and Bottom, while the entire Left edge and Right edge are open glowing molten slag pouring trenches behind caution lines for head-on Ring-Out shoves!",
    conceptArt: "assets/concept_gallery/battlebots_topdown_3d/maps_10/ringout_06_smelter_side_pits.jpg",
    accent: "#f59e0b",
    themeColor: "#f59e0b",
    floorTint: "rgba(0, 0, 0, 0)",
    gridColor: "rgba(245, 158, 11, 0.12)",
    borderGlow: "#f59e0b",
    frictionMult: 1.0,
    wallBounceMult: 1.20,
    sawDmgMult: 1.0,
    hazardType: "ringout_left_right"
  },
  {
    id: "arena_11_sky_ledge",
    num: 11,
    arenaNum: 11,
    badge: "👑 ARENA 11",
    category: "RING-OUT MAP",
    name: "ROPPONGI SKY-PENTHOUSE LEDGE",
    shortName: "👑 SKY LEDGE",
    subtitle: "RING-OUT: All 4 Sides Red Laser Rooftop Over 80-Story Drop",
    hazardDesc: "Luxury dark-obsidian and 24K-gold rooftop platform with glowing crimson laser boundary lines and zero walls on all 4 sides overlooking an 80-story night-city abyss!",
    conceptArt: "assets/concept_gallery/battlebots_topdown_3d/maps_10/ringout_10_sky_tower_ledge.jpg",
    accent: "#f43f5e",
    themeColor: "#f43f5e",
    floorTint: "rgba(0, 0, 0, 0)",
    gridColor: "rgba(244, 63, 94, 0.12)",
    borderGlow: "#f43f5e",
    frictionMult: 1.0,
    wallBounceMult: 1.25,
    sawDmgMult: 1.0,
    hazardType: "ringout_sky_ledge"
  },
  {
    id: "arena_12_scrap_kennel",
    num: 12,
    arenaNum: 12,
    badge: "🧨 ARENA 12",
    category: "2x MINI-BOT AMBUSH MAP",
    name: "SHIBUYA SCRAP-HOUND KENNEL",
    shortName: "🧨 BOMB BUGGIES",
    subtitle: "AMBUSH: 2x 'TICK-BOOM' Bomb Buggies (220 HP) Attack Once/Round",
    hazardDesc: "Enclosed junkyard pit with Top-Center & Bottom-Center red warning hatch bays. Once per round, 2 fast Kamikaze Bomb Buggies (220 HP) drive out to chase both players (+80 HP & Nitro Boost on kill)!",
    conceptArt: "assets/concept_gallery/battlebots_topdown_3d/maps_10/minibot_01_scrap_hound_kennel.jpg",
    accent: "#ef4444",
    themeColor: "#ef4444",
    floorTint: "rgba(0, 0, 0, 0)",
    gridColor: "rgba(239, 68, 68, 0.12)",
    borderGlow: "#ef4444",
    frictionMult: 1.0,
    wallBounceMult: 1.10,
    sawDmgMult: 1.0,
    hazardType: "minibot_bomb_buggies"
  },
  {
    id: "arena_13_drone_foundry",
    num: 13,
    arenaNum: 13,
    badge: "🕷️ ARENA 13",
    category: "2x MINI-BOT AMBUSH MAP",
    name: "AKIHABARA DRONE-HIVE FOUNDRY",
    shortName: "🕷️ TESLA SPIDERS",
    subtitle: "AMBUSH: 2x 'VOLT-LEECH' Tesla Spiders (220 HP) Attack Once/Round",
    hazardDesc: "Cobalt cyber-foundry with Top-Center & Bottom-Center hexagonal drone bays. Once per round, 2 Volt-Leech Spiders (220 HP) emerge to zap & slow both players (+120 HP Shield Battery on kill)!",
    conceptArt: "assets/concept_gallery/battlebots_topdown_3d/maps_10/minibot_02_drone_hive_foundry.jpg",
    accent: "#22d3ee",
    themeColor: "#22d3ee",
    floorTint: "rgba(0, 0, 0, 0)",
    gridColor: "rgba(34, 211, 238, 0.12)",
    borderGlow: "#22d3ee",
    frictionMult: 1.0,
    wallBounceMult: 1.10,
    sawDmgMult: 1.0,
    hazardType: "minibot_volt_spiders"
  },
  {
    id: "arena_17_cryo_lab",
    num: 17,
    arenaNum: 17,
    badge: "❄️ ARENA 17",
    category: "2x MINI-BOT AMBUSH MAP",
    name: "HOKKAIDO CRYO-DRONE LAB",
    shortName: "❄️ CRYO DRONES",
    subtitle: "AMBUSH: 2x 'FROST-MITE' Cryo Drones (210 HP) Attack Once/Round",
    hazardDesc: "Frosted steel cryo-laboratory with Top-Center & Bottom-Center airlock bays. Once per round, 2 Cryo-Sprayer Drones (210 HP) exit the airlocks to chill both fighters (+110 HP Repair on kill)!",
    conceptArt: "assets/concept_gallery/battlebots_topdown_3d/maps_10/minibot_06_cryo_drone_lab.jpg",
    accent: "#38bdf8",
    themeColor: "#38bdf8",
    floorTint: "rgba(0, 0, 0, 0)",
    gridColor: "rgba(56, 189, 248, 0.12)",
    borderGlow: "#38bdf8",
    frictionMult: 1.02,
    wallBounceMult: 1.10,
    sawDmgMult: 1.0,
    hazardType: "minibot_cryo_mites"
  }
];

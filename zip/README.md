# MOOB - Map Optimization and Ongoing Bug-fixing

Welcome to MOOB v0.3. This mod is designed to enhance and streamline the Map Editor in Cities Skylines 2, introducing key improvements and fixes to elevate your map editing experience.

## Installation Instructions

### Prerequisites

1. **Install BepInEx 5:** MOOB requires BepInEx 5 to function. You can install BepInEx 5 via the Thunderstore. Please follow the installation guide provided there.

### Installing MOOB

1. **Download MOOB:** You can download the latest version of MOOB from Thunderstore or our [GitHub repository](https://github.com/Cities2Modding/MOOB).

2. **Place the Mod in the Plugins Folder:** After downloading MOOB, place the mod file in the `BepInEx/plugins` folder within your Cities Skylines 2 game directory.

3. **Run the Game:** To ensure that BepInEx configurations are correctly set up, run the game at least once after installing BepInEx 5 and before adding MOOB.

## Using MOOB

Once installed, MOOB will automatically apply its enhancements to the Map Editor. Simply start Cities Skylines 2 and open the Map Editor to experience the improvements.

## Features
(Thanks to CO's recent updates MOOB only now needs to be used for the editor switch enabling. The previous import/export features are now redundant.)
1. **Enabled Map Editor Option in Game:** Unlocks the map editor within Cities Skylines 2, allowing direct access for map creation and editing.

## Deprecated Features
1. **Improved Heightmap Import:** Utilizes Windows OpenFileDialog for easier heightmap selection and import. (It was easier than using the games ImageAsset functionality)
2. **Heightmap Export to 16-bit RAW:** Enables exporting heightmaps in the 16-bit RAW format for greater precision and compatibility.
3. **Import .PNG, .TIFF or .RAW images:** 16-bit RAW is preferred but if you need to you can use PNG or TIFF formats.
4. **Automatically resize Cities Skylines 1 Heightmaps**: If you import an 1081x1081 heightmap it will resize to an approximate 1:1ish scale to Cities Skylines 1.
5. **8-bit to 16-bit channel conversion**: If you import an 8-bit image it will convert it for you. It will run 10 passes of blurring to try to prevent terracing. (This is WIP and results may not be the best.)

MOOB will be getting new improvements in the near future, so the feature set will expand.

## Credits
MOOB by optimus-code and 89pleasure

Special thanks to the following contributors for their invaluable assistance:

- **Dimentox:** For contributions to the Terrain heightmap system.
- **Captain-Of-Coit:** For contributions to the project build system.

Your efforts have been instrumental in bringing MOOB to life.

## Support and Feedback

Encounter any issues or have suggestions? Feel free to open an issue on our [GitHub repository](https://github.com/Cities2Modding/MOOB) or reach out to us there.
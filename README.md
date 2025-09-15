# Launch Neovim Projects from Omarchy's Main Menu

Seamlessly open your projects in Neovim directly from Omarchy's menu interface.

## Features
- Automatically scans your `/projects` folder to populate the submenu
- Navigate through nested directories with configurable depth levels
- Quick project access without manual navigation

## Screenshots

<img width="480" height="780" alt="Main menu with Projects option" src="https://github.com/user-attachments/assets/85adaa40-4d4e-452a-aa03-f813faa0aa12" />

*Projects menu integrated into Omarchy's main interface*

<img width="636" height="526" alt="Project selection submenu" src="https://github.com/user-attachments/assets/e04fda2d-44ad-4129-bb81-c5529ed664ce" />

*Select any project folder to open it in Neovim*

## Installation

### Use the new installation CLI with 

```
npx omarchy-expanded-menus
```

### Manual installation

1. **Backup** your existing `omarchy-menu` file:
   ```bash
   cp /home/{user}/.local/share/omarchy/bin/omarchy-menu ~/omarchy-menu.backup
   ```

2. **Replace** with the modified version from this repository

## Configuration

Set the navigation depth for Projects and Workflows sections by modifying these variables (lines 10-11):

```bash
PROJECTS_MENU_LEVELS=${PROJECTS_MENU_LEVELS:-1}  # Default: 1 levels
WORKFLOW_MENU_LEVELS=${WORKFLOW_MENU_LEVELS:-1}  # Default: 1 level
```

**Maximum depth:** 3 levels

---

*Note: Remember to replace `{user}` with your actual username during installation.*

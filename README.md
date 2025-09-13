## Launch your projects in NVIM from Omachy's main menu

This modification will allow you to launch nvim straight from the menu, it will scan your /projects folder to populate the submenu.

<img width="480" height="780" alt="screenshot-2025-09-13_19-12-18" src="https://github.com/user-attachments/assets/85adaa40-4d4e-452a-aa03-f813faa0aa12" />

When selecting the Projects menu a list of your folder will appear, select one and nvim will open in that path

<img width="636" height="526" alt="screenshot-2025-09-13_19-09-17" src="https://github.com/user-attachments/assets/e04fda2d-44ad-4129-bb81-c5529ed664ce" />


How to add the modification

A)

1) Backup `omarchy-menu` file in `/home/{user}/.local/share/omarchy/bin/`
2) Replace `omarchy-menu` with this file

B)

1) Add this code to your `omarchy-menu` file

```
show_main_menu() {
  go_to_menu "$(menu "Go" "󰀻  Apps\n  Projects\n󰧑  Learn\n  Capture\n󰔎  Toggle\n  Style\n  Setup\n󰉉  Install\n󰭌  Remove\n  Update\n  About\n  System")"
}
```

2) Add Projects menu logic

```
show_projects_menu() {
  local projects_dir="$HOME/projects"

  if [[ ! -d "$projects_dir" ]]; then
    notify-send "Projects" "No projects directory found at $projects_dir"
    show_main_menu
    return
  fi

  local project_dirs=()
  local menu_options=""

  while IFS= read -r -d '' dir; do
    local project_name=$(basename "$dir")
    project_dirs+=("$project_name")
    if [[ -z "$menu_options" ]]; then
      menu_options="  $project_name"
    else
      menu_options="$menu_options\n  $project_name"
    fi
  done < <(find "$projects_dir" -maxdepth 1 -type d -not -path "$projects_dir" -print0 2>/dev/null | sort -z)

  if [[ ${#project_dirs[@]} -eq 0 ]]; then
    notify-send "Projects" "No project folders found in $projects_dir"
    show_main_menu
    return
  fi

  local selected_project=$(menu "Projects" "$menu_options")

  if [[ -z "$selected_project" || "$selected_project" == "CNCLD" ]]; then
    show_main_menu
    return
  fi

  local project_name="${selected_project#*  }"
  project_name="${project_name##*( )}"
  project_name="${project_name%%*( )}"

  local project_path="$projects_dir/$project_name"

  if [[ -d "$project_path" ]]; then
    alacritty --working-directory "$project_path" -e nvim .
  else
    notify-send "Error" "Project directory not found: $project_path"
    show_main_menu
  fi
}
```

3) Add this to your `go_to_menu` function

```
*projects*) show_projects_menu ;;
```




#!/bin/zsh
project_dir="${0:A:h}"
if [[ -d "$project_dir/tools/Blender.app" ]]; then
  open -a "$project_dir/tools/Blender.app" "$project_dir/output/office.blend"
else
  open -a Blender "$project_dir/output/office.blend"
fi

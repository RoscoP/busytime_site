
# npm versio patch
npm run build
del -rec -for "$PSScriptRoot/../docs/"
git checkout HEAD "$PSScriptRoot/../docs/CNAME"
copy -rec "$PSScriptRoot/build/*" "../docs"
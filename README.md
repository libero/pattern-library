Libero pattern library
======================


## Code of Conduct
See [CODE-OF-CONDUCT](CODE-OF-CONDUCT.md)

## Pipeline

The build process uses a Node.js container image to build all assets, and copy them out of the container into `export/`.

`export/` can then be packaged to be released on Github, or reused elsewhere.

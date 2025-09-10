# Discover Local Network

Provides a simple command that scans the local network for connected machines.

Scanning is done via the `ping` command, so machines that do not respond on this port or this command are not detected.

## Installation

### Pour l'instant

```shell
git clone git@github.com:pulsovi/discover-local-network.git
cd ./discover-local-network
npm install
npm install -g .
```

### Une fois que j'aurais publié

`npm install -g discover-local-network`

or 

`npm install -g .`

## Usage

`discover-local-network 192.168.1.0/24`

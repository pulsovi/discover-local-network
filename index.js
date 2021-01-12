#!/usr/bin/env node
const EventEmitter = require('events');

const Configstore = require('configstore');
const ip = require('ip');
const arp = require('node-arp');
const ping = require('ping');

const { name: packageName } = require('./package.json');

const config = new Configstore(packageName, { arp: {}});

class Discoverer extends EventEmitter {
  constructor(ipRange, options = {}) {
    super();
    Object.assign(this, {
      details: true,
      ipRange,
      printAtEnd: false,
      showProgress: false,
    }, options);

    this.run();
  }

  end() {
    // eslint-disable-next-line id-length
    this.found.sort((a, b) => a.longIp - b.longIp);
    if (this.showProgress) console.info();
    if (this.printAtEnd) {
      this.found.forEach(displayItem => {
        console.info(displayItem.message);
      });
    }
    this.emit('end', this.found);
  }

  run() {
    const subnet = ip.cidrSubnet(this.ipRange);
    const start = ip.toLong(subnet.firstAddress);
    const stop = ip.toLong(subnet.lastAddress);

    this.ipList = [];
    for (let i = start; i <= stop; ++i)
      this.ipList.push(ip.fromLong(i));

    this.length = this.ipList.length;
    this.found = [];
    this.counter = -1;
    this.alives = 0;
    this.ipList.forEach(ipAddress => this.testAlive(ipAddress));
    this.progress();
  }

  getMac(ipAddress) {
    arp.getMAC(ipAddress, (err, mac) => {
      if (err) {
        this.found.push({
          longIp: ip.toLong(ipAddress),
          message: ipAddress,
        });
        this.progress();
        return;
      }
      this.getName({
        ipAddress,
        longIp: ip.toLong(ipAddress),
        mac,
      });
    });
  }

  getName(ipObj) {
    const { ipAddress, mac } = ipObj;
    const name = config.get(`arp.${mac}`);

    if (name) {
      ipObj.message = `${ipAddress}\t${mac}\t${name}`;
      ipObj.name = name;
    } else ipObj.message = `${ipAddress}\t${mac}`;

    this.found.push(ipObj);
    this.progress();
  }

  progress() {
    this.counter += 1;
    this.emit('progress', this.counter, this.length);
    if (this.showProgress) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`${this.counter}/${this.length} | ${this.alives} alives`);
    }
    if (this.counter === this.length) this.end();
  }

  testAlive(ipAddress) {
    ping.sys.probe(ipAddress, isAlive => {
      if (isAlive) {
        this.alives += 1;
        this.emit('alive', ipAddress);
        if (this.details)
          this.getMac(ipAddress);
        else {
          this.found.push({
            longIp: ip.toLong(ipAddress),
            message: ipAddress,
          });
          this.progress();
        }
      } else {
        this.emit('dead', ipAddress);
        this.progress();
      }
    });
  }
}

function setName(mac, name) {
  config.set(`arp.${mac}`, name);
}

module.exports = { Discoverer, setName };

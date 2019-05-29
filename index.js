// jshint esversion: 6
const arp = require('node-arp');
const ip = require('ip');
const ping = require('ping');

const cidr = process.argv[2];
const subnet = ip.cidrSubnet(cidr);
const start = ip.toLong(subnet.firstAddress);
const stop = ip.toLong(subnet.lastAddress);

var ipList = [];
for (let i = start; i <= stop; ++i) {
  ipList.push(ip.fromLong(i));
}

var displayList = [];
var endings = -1;
next();

ipList.forEach(function(ipAddress) {
  ping.sys.probe(ipAddress, function(isAlive) {
    if (isAlive) {
      arp.getMAC(ipAddress, function(err, mac){
        displayList.push({
          longIp: ip.toLong(ipAddress),
          message: ipAddress + (err ? '' : '\t' + mac)
        });
        next();
      });
    } else {
      next();
    }
  });
});

function next() {
  ++endings;
  printProgress(endings + '/' + ipList.length + ' | ' + displayList.length + ' alives');
  if(endings == ipList.length) {
    console.log('');
    printList();
  }
}

function printProgress(progress){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress);
}

function printList(){
  displayList.sort(function(a, b){
    return a.longIp - b.longIp;
  });
  displayList.forEach(function(displayItem){
    console.log(displayItem.message);
  });
}

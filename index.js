import { pipeline, finished } from 'stream'
import openpgp from 'openpgp'
import fs from 'fs'

const publicKeys = await openpgp.readKey({ armoredKey: fs.readFileSync('public-key.asc', { encoding: 'utf8' }) });
const now = new Date();
const encryptedFileName = `sample_data_encrypted.json`;
const fileToEncrypt = 'sample_data.json';
const stream = fs.createReadStream(fileToEncrypt);
const encrypted = await openpgp.encrypt({
  message: await openpgp.Message.fromText(stream),
  publicKeys
});
const ws = fs.createWriteStream(`${fileToEncrypt}.enc`);
pipeline(encrypted, ws, (err, val) => {
  // this is called
  console.log('file written', err, val)
});
finished(encrypted, (err) => { // this will be called
// finished(encrypted, {readable: false}, (err) => { // and so will this
  if (!err) {
    console.log('encrypted finished writing without failure')
  } else {
    console.log('uh oh:', err)
  }
})
encrypted.on('end', () => {
  console.log('encrypted stream end event');
});
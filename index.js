import { pipeline, finished } from 'stream'
import openpgp from 'openpgp'
import fs from 'fs'

const publicKey = await openpgp.readKey({ armoredKey: fs.readFileSync('public-key.asc', { encoding: 'utf8' }) });
const now = new Date();
const encryptedFileName = `sample_data_encrypted.json`;
const fileToEncrypt = 'sample_data.json';
const stream = fs.createReadStream(fileToEncrypt);
const encrypted = await openpgp.encrypt({
  message: await openpgp.createMessage({ text: stream }),
  encryptionKeys: publicKey
});
const ws = fs.createWriteStream(`${fileToEncrypt}.enc`);
pipeline(encrypted, ws, (err, val) => {
  console.log('file written', err, val)
});
// finished(encrypted, (err) => { // this won't be called
finished(encrypted, {readable: false}, (err) => { // this will be called
  if (!err) {
    console.log('encrypted finished writing without failure')
  } else {
    console.log('uh oh:', err)
  }
})
encrypted.on('end', () => {
  console.log('encrypted stream end event');
});
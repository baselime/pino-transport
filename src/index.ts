import build from 'pino-abstract-transport';
import Axios from 'axios';
type ClientOpts = {
    baselimeApiKey: string;
    service?: string;
    dataset?: string;
    namespace?: string;
}

function sendToBaselime(opts: ClientOpts, toSend: any[]) {
    return Axios.post('https://api.baselime.io/v1', toSend, {
        headers: {
            'x-api-key': opts.baselimeApiKey,
            'x-service': opts.service,
            'x-dataset': opts.dataset,
            'x-namespace': opts.namespace,
        }
     });
}

export default function (opts: ClientOpts) {
  if (!opts?.baselimeApiKey) {
    throw new Error('baselimeApiKey is required!');
  }
 
  opts.dataset = opts.dataset || 'pino-logs';

  let toSend: any[] = [];
  let immediate: null | ReturnType<typeof setImmediate> = null;

  function send() {
    sendToBaselime(opts, toSend);
    toSend = [];
    immediate = null;
  }

  return build(
    function (source) {
      source.on('data', function (obj) {
        toSend.push(obj);
        if (!immediate) {
          immediate = setImmediate(send);
        }
      });
    },
    {
      parseLine: (line) => ({ ...JSON.parse(line) }),
      async close() {
        if (toSend.length > 0) {
          clearImmediate(immediate);
          await sendToBaselime(opts, toSend);
        }
      },
    },
  );
};
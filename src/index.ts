import build from 'pino-abstract-transport';
import Axios from 'axios';
type ClientOpts = {
    baselimeApiKey: string;
    service?: string;
    dataset?: string;
    namespace?: string;
}

function sendToBaselime(opts: ClientOpts, toSend: any[]) {
    return Axios.post(`https://events.baselime.io/v1/${opts.dataset}`, toSend, {
        headers: {
            'x-api-key': opts.baselimeApiKey,
            'x-service': opts.service,
            'x-namespace': opts.namespace,
        }
     });
}

const levels: Record<number, string> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
}


export default function (opts: ClientOpts) {
  if (!opts?.baselimeApiKey) {
    throw new Error('baselimeApiKey is required!');
  }
 
  opts.dataset = opts.dataset || 'pino-logs';

  let toSend: any[] = [];
  let immediate: null | ReturnType<typeof setImmediate> = null;

  function send() {
    sendToBaselime(opts, toSend).catch(console.error);
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
      parseLine: (line) => {
        const log = JSON.parse(line) as any;
        if(log.level) {
          log.level = levels[log.level || 30]
        }
        return log;
      },
      async close() {
        if (toSend.length > 0) {
          clearImmediate(immediate);
          await sendToBaselime(opts, toSend);
        }
      },
    },
  );
};
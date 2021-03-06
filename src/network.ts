import { Socket, createSocket } from "dgram";
import {
  NetworkOnError,
  NetworkOnMessage,
  NetworkSend
} from "./types/network_types";
/** @internal */
export const initNetwork = (
  ownPort: number,
  distantPort: number,
  networkOnError: NetworkOnError,
  networkOnMessage: NetworkOnMessage
): Promise<[Socket, NetworkSend]> =>
  new Promise((resolve, reject) => {
    const server = createSocket("udp4");

    const networkSend: NetworkSend = (msg): Promise<void> =>
      new Promise((resolveSend, rejectSend) =>
        server.send(msg, distantPort, "localhost", err => {
          if (err) {
            rejectSend(err);
          }
          resolveSend();
        })
      );

    server.on("error", err => {
      console.error(`ERROR - Server:\n${err.stack}`);
      server.close();
      networkOnError(err);
    });

    server.on("message", networkOnMessage);

    server.on("listening", () => {
      const address = server.address();
      console.log(
        `Server started successfuly, listening on ${
          typeof address === "string"
            ? address
            : `${address.address}:${address.port}`
        }`
      );
      resolve([server, networkSend]);
    });

    server.bind(ownPort);
  });

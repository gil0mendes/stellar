'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  servers: {
    tcp: function tcp(api) {
      return {
        // ---------------------------------------------------------------------
        // Enable server?
        // ---------------------------------------------------------------------
        enable: process.env.ENABLE_TCP_SERVER !== undefined,

        // ---------------------------------------------------------------------
        // TCP or TLS?
        // ---------------------------------------------------------------------
        secure: false,

        // ---------------------------------------------------------------------
        // Server options
        //
        // passed to tls.createServer if secure=true, should contain SSL
        // certificates.
        // ---------------------------------------------------------------------
        serverOptions: {},

        // ---------------------------------------------------------------------
        // Server port
        // ---------------------------------------------------------------------
        port: 5000,

        // ---------------------------------------------------------------------
        // IP to listen on
        //
        // Use 0.0.0.0 for all.
        // ---------------------------------------------------------------------
        bindIP: '0.0.0.0',

        // ---------------------------------------------------------------------
        // Enable TCP KeepAlive
        //
        // Send pings on each connection.
        // ---------------------------------------------------------------------
        setKeepAlive: false,

        // ---------------------------------------------------------------------
        // Delimiter string for incoming messages
        // ---------------------------------------------------------------------
        delimiter: '\n',

        // ---------------------------------------------------------------------
        // Maximum incoming message string length in Bytes (use 0 for Infinity)
        // ---------------------------------------------------------------------
        maxDataLength: 0,

        // ---------------------------------------------------------------------
        // What message to send down to a client who request a `quit`
        // ---------------------------------------------------------------------
        goodbyeMessage: 'Bye!'
      };
    }
  }
};
var test = exports.test = {
  servers: {
    tcp: function tcp(api) {
      return {
        enabled: true,
        port: 5001,
        secure: false
      };
    }
  }
};
//# sourceMappingURL=tcp.js.map

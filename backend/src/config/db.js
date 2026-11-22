
import mongoose from "mongoose";
import tls from "node:tls";


/*
|--------------------------------------------------------------------------
| ATLAS TLS DIAGNOSTIC HOSTS
|--------------------------------------------------------------------------
|
| These are the three Atlas server addresses from your Render logs.
| This temporary test checks TLS connectivity without connecting
| to or modifying the database.
|
|--------------------------------------------------------------------------
*/

const ATLAS_TLS_HOSTS = [
  "ac-35ldhjm-shard-00-00.qkemcgk.mongodb.net",
  "ac-35ldhjm-shard-00-01.qkemcgk.mongodb.net",
  "ac-35ldhjm-shard-00-02.qkemcgk.mongodb.net"
];


/*
|--------------------------------------------------------------------------
| CHECK TLS CONNECTION TO ATLAS
|--------------------------------------------------------------------------
*/

const checkAtlasTLS = (host) => {

  return new Promise((resolve, reject) => {

    let completed = false;

    const socket = tls.connect({

      host,

      port: 27017,

      servername: host,

      rejectUnauthorized: true,

      // Force TLS 1.2 for this diagnostic test.
      minVersion: "TLSv1.2",

      maxVersion: "TLSv1.2"

    });


    socket.once("secureConnect", () => {

      if (completed) return;

      completed = true;


      console.log("");

      console.log(`TLS SUCCESS: ${host}`);

      console.log(
        "TLS protocol:",
        socket.getProtocol()
      );

      console.log(
        "Certificate authorized:",
        socket.authorized
      );


      socket.end();

      resolve(true);

    });


    socket.once("error", (error) => {

      if (completed) return;

      completed = true;


      console.error("");

      console.error(`TLS FAILED: ${host}`);

      console.error(
        "Error name:",
        error.name
      );

      console.error(
        "Error message:",
        error.message
      );


      reject(error);

    });


    socket.setTimeout(10000, () => {

      socket.destroy(
        new Error("TLS handshake timed out after 10 seconds.")
      );

    });

  });

};


/*
|--------------------------------------------------------------------------
| CONNECT TO MONGODB
|--------------------------------------------------------------------------
*/

const connectDB = async () => {

  try {

    const mongoURI =
      String(
        process.env.MONGO_URI || ""
      ).trim();


    /*
     * Make sure the MongoDB connection string
     * has been configured.
     */

    if (!mongoURI) {

      console.error("");

      console.error(
        "=========================================="
      );

      console.error(
        "       MONGODB CONFIGURATION ERROR"
      );

      console.error(
        "=========================================="
      );

      console.error(
        "MONGO_URI is not defined in environment variables."
      );

      console.error(
        "=========================================="
      );

      console.error("");


      connectDB.isConnected = false;


      return false;

    }


    /*
     * If Mongoose is already connected, don't create
     * another connection.
     */

    if (
      mongoose.connection.readyState === 1
    ) {

      connectDB.isConnected = true;


      return true;

    }


    /*
     * Display runtime and package diagnostics.
     */

    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      "       RUNTIME DIAGNOSTICS"
    );

    console.log(
      "=========================================="
    );

    console.log(
      "Node.js version:",
      process.version
    );

    console.log(
      "OpenSSL version:",
      process.versions.openssl
    );

    console.log(
      "Mongoose version:",
      mongoose.version
    );

    console.log(
      "MongoDB driver version:",
      mongoose.mongo?.version || "Not available"
    );

    console.log(
      "Platform:",
      process.platform
    );

    console.log(
      "Architecture:",
      process.arch
    );

    console.log(
      "=========================================="
    );


    /*
     * Test direct TLS connectivity to all three
     * MongoDB Atlas servers.
     */

    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      "       TESTING ATLAS TLS CONNECTIONS"
    );

    console.log(
      "=========================================="
    );


    const tlsResults = await Promise.allSettled(

      ATLAS_TLS_HOSTS.map((host) => {

        return checkAtlasTLS(host);

      })

    );


    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      "       TLS DIAGNOSTIC SUMMARY"
    );

    console.log(
      "=========================================="
    );


    tlsResults.forEach((result, index) => {

      console.log(
        ATLAS_TLS_HOSTS[index],
        result.status === "fulfilled"
          ? "TLS SUCCESS"
          : "TLS FAILED"
      );

    });


    console.log(
      "=========================================="
    );


    /*
     * Connect to MongoDB Atlas using Mongoose.
     */

    console.log("");

    console.log(
      "Connecting to MongoDB Atlas..."
    );


    const conn =
      await mongoose.connect(
        mongoURI,
        {
          serverSelectionTimeoutMS: 15000,

          connectTimeoutMS: 15000,

          socketTimeoutMS: 45000
        }
      );


    /*
     * Mark the database as connected.
     */

    connectDB.isConnected = true;


    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      "       MONGODB CONNECTED SUCCESSFULLY"
    );

    console.log(
      "=========================================="
    );

    console.log(
      `Host: ${conn.connection.host}`
    );

    console.log(
      `Database: ${conn.connection.name}`
    );

    console.log(
      "=========================================="
    );

    console.log("");


    return true;

  } catch (error) {

    connectDB.isConnected = false;


    console.error("");

    console.error(
      "=========================================="
    );

    console.error(
      "       MONGODB CONNECTION FAILED"
    );

    console.error(
      "=========================================="
    );

    console.error(
      "Error name:",
      error.name
    );

    console.error(
      "Error message:",
      error.message
    );


    /*
     * Display detailed MongoDB server-selection
     * errors without exposing the connection URI.
     */

    if (error.reason?.servers) {

      console.error("");

      console.error(
        "MongoDB server details:"
      );

      for (
        const [address, server] of
        error.reason.servers
      ) {

        console.error(
          `Server: ${address}`
        );

        console.error(
          `Server error: ${
            server.error?.message ||
            "No additional server error available."
          }`
        );

      }

    }


    /*
     * Display the underlying error when available.
     */

    if (error.cause) {

      console.error("");

      console.error(
        "Underlying error:",
        error.cause.message ||
        error.cause
      );

    }


    console.error("");

    console.error(
      "Check the MongoDB Atlas cluster status, network access, database credentials, and connection string."
    );

    console.error(
      "=========================================="
    );

    console.error("");


    return false;

  }

};


/*
|--------------------------------------------------------------------------
| DATABASE CONNECTION STATE
|--------------------------------------------------------------------------
*/

connectDB.isConnected = false;


/*
|--------------------------------------------------------------------------
| DISCONNECT FROM MONGODB
|--------------------------------------------------------------------------
|
| Used during graceful server shutdown.
|
|--------------------------------------------------------------------------
*/

connectDB.disconnect =
  async () => {

    try {

      /*
       * Nothing needs to be done if there is
       * no active MongoDB connection.
       */

      if (
        mongoose.connection.readyState === 0
      ) {

        connectDB.isConnected = false;


        return;

      }


      console.log(
        "Closing MongoDB connection..."
      );


      await mongoose.connection.close();


      connectDB.isConnected = false;


      console.log(
        "MongoDB connection closed successfully."
      );

    } catch (error) {

      connectDB.isConnected = false;


      console.error(
        "MongoDB disconnect error:",
        error.message
      );


      throw error;

    }

  };


/*
|--------------------------------------------------------------------------
| MONGOOSE CONNECTION EVENTS
|--------------------------------------------------------------------------
*/

mongoose.connection.on(
  "connected",
  () => {

    connectDB.isConnected = true;

  }
);


mongoose.connection.on(
  "disconnected",
  () => {

    connectDB.isConnected = false;


    console.error(
      "MongoDB connection lost."
    );

  }
);


mongoose.connection.on(
  "reconnected",
  () => {

    connectDB.isConnected = true;


    console.log(
      "MongoDB connection restored."
    );

  }
);


mongoose.connection.on(
  "error",
  (error) => {

    console.error(
      "MongoDB connection error:",
      error.message
    );

  }
);


export default connectDB;

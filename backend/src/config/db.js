import mongoose from "mongoose";


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
        "MONGO_URI is not defined in .env"
      );

      console.error(
        "=========================================="
      );

      console.error("");


      connectDB.isConnected =
        false;


      return false;

    }


    /*
     * If Mongoose is already connected, don't create
     * another connection.
     */

    if (
      mongoose.connection.readyState === 1
    ) {

      connectDB.isConnected =
        true;


      return true;

    }


    console.log("");

    console.log(
      "Connecting to MongoDB Atlas..."
    );


    /*
     * Connect to MongoDB Atlas.
     */

    const conn =
      await mongoose.connect(
        mongoURI,
        {
          serverSelectionTimeoutMS:
            10000,

          connectTimeoutMS:
            10000,

          socketTimeoutMS:
            45000
        }
      );


    /*
     * Mark the database as connected.
     */

    connectDB.isConnected =
      true;


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

    connectDB.isConnected =
      false;


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
      `Error: ${error.message}`
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

connectDB.isConnected =
  false;


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
        mongoose.connection.readyState ===
        0
      ) {

        connectDB.isConnected =
          false;


        return;

      }


      console.log(
        "Closing MongoDB connection..."
      );


      await mongoose.connection.close();


      connectDB.isConnected =
        false;


      console.log(
        "MongoDB connection closed successfully."
      );

    } catch (error) {

      connectDB.isConnected =
        false;


      console.error(
        "MongoDB disconnect error:",
        error
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

    connectDB.isConnected =
      true;

  }
);


mongoose.connection.on(
  "disconnected",
  () => {

    connectDB.isConnected =
      false;


    console.error(
      "MongoDB connection lost."
    );

  }
);


mongoose.connection.on(
  "reconnected",
  () => {

    connectDB.isConnected =
      true;


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
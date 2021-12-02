exports.helloWorld = async (req, res) => {
    try {
      if (req.body.name) {
        res.status(200).send("Ciao " + req.body.name);
      } else {
        res.status(200).send("Ups!What's your name?");
      }
    } catch (error) {
      //return an error
      console.log("got error: ", error);
      res.status(500).send(error);
    }
   };
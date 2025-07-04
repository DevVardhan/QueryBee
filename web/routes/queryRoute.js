import express from "express";
import queryController from "../controller/queryController.js"; 

const router = express.Router(); 

// Health check route
router.get('/', (req, res) => {
    res.status(200).json({ message: "server active" });
});

// Query route with pre-processing middleware
router.get('/query', queryController.preProcess, queryController.openQuery);

// Query complexity check (debug)
router.get('/analize' , queryController.preProcess , (req, res) => {
    res.status(200).json({ message: `${req.complexity}` });
}   );

router.get('/schema' ,queryController.fetchSchema );

export default router;

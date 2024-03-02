import express from 'express';
import multer from 'multer';
import fs from 'fs';

import {
    CreatePortfolio,
    GetAllPortfolios,
    GetPortfolioByID,
    PushImageToPortfolio,
    UpdatePortfolio,
    DeletePortfolio
} from '../services/portfolioItem.js';
  
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '.jpg');
    }
});
  
const upload = multer({ storage: storage });

const portfolioController  = express.Router();

portfolioController.post('/', async (req, res) => {
    try {
        const userID = req.userID
        
        if (!userID) {
            return res.status(500).json({
                err: "missing required 'userID' in request data"
            });
        }

        const requiredFields = ['names', 'descriptions'];

        const requiredFieldsWithEmbeddedFields = ['names', 'descriptions'];
        const requiredEmbeddedFields = ['ru', 'en'];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ err: `missing required field: '${field}'` });
            }

            if (requiredFieldsWithEmbeddedFields.includes(field)) {
                if (typeof req.body[field] !== typeof {}) {
                    return res.status(400).json({ err: `invalid field type: '${field}'` });
                }

                for (const embedded of requiredEmbeddedFields) {
                    if (!req.body[field][embedded]) {
                        return res.status(400).json({ err: `missing required field: '${field}.${embedded}'` });
                    }
                }
            }
        }

        const data = req.body;
        const portfolio = await CreatePortfolio(userID, data);

        return res.status(201).json(portfolio);
    } catch (e) {
        if (e.name === 'ServiceError') {
            res.status(e.code).json({
                err: e.message
            });
        } else {
            res.status(500).json({
                err: e.message,
            });
        }
    }
});

portfolioController.get('/', async (req, res) => {
    try {
        const userID = req.userID
        
        if (!userID) {
            return res.status(500).json({
                err: "missing required 'userID' in request data"
            });
        }

        const portfolios = await GetAllPortfolios(userID);

        return res.status(200).json(portfolios);
    } catch (e) {
        res.status(500).json({
            err: e.message,
        });
    }
});

portfolioController.get('/:id', async (req, res) => {
    try {
        const userID = req.userID
        const isAdmin = req.isAdmin || false;
        
        if (!userID) {
            return res.status(500).json({
                err: "missing required 'userID' in request data"
            });
        }

        const portfolioID = req.params.id;

        if (!portfolioID) {
            return res.status(400).json({
                err: "missing required 'id' parameter"
            });
        }

        const portfolio = await GetPortfolioByID(userID, portfolioID, isAdmin);

        return res.status(200).json(portfolio);
    } catch (e) {
        res.status(500).json({
            err: e.message,
        });
    }
});

portfolioController.post('/:id/upload', upload.single('image'),async (req, res) => {
    try {
        const userID = req.userID
        const isAdmin = req.isAdmin || false;
        
        if (!userID) {
            return res.status(500).json({
                err: "missing required 'userID' in request data"
            });
        }

        const portfolioID = req.params.id;

        if (!portfolioID) {
            return res.status(400).json({
                err: "missing required 'id' parameter"
            });
        }

        const img = req.file.filename;

        const result = await PushImageToPortfolio(userID, portfolioID, isAdmin, img);

        if (result.matchedCount === 0) {
            fs.unlink('uploads/' + img, (err) => {
                if (err) {
                    console.error('[x] failed to remove a file: ', err)
                } else {
                    console.log(`[!] ${img} is deleted`)
                }
            });

            return res.status(404).json({
                err: 'not found',
            });
        }

        return res.status(204).end();
    } catch (e) {
        res.status(500).json({
            err: e.message,
        });
    }
});

portfolioController.patch('/:id', async (req, res) => {
    try {
        const userID = req.userID
        const isAdmin = req.isAdmin || false;
        
        if (!userID) {
            return res.status(500).json({
                err: "missing required 'userID' in request data"
            });
        }

        const portfolioID = req.params.id;

        if (!portfolioID) {
            return res.status(400).json({
                err: "missing required 'id' parameter"
            });
        }

        const data = req.body;

        const result = await UpdatePortfolio(userID, portfolioID, isAdmin, data);

        if (result.matchedCount === 0) {
            return res.status(404).json({
                err: 'not found',
            });
        }

        return res.status(204).end();
    } catch (e) {
        res.status(500).json({
            err: e.message,
        });
    }
});

portfolioController.delete('/:id', async (req, res) => {
    try {
        const userID = req.userID
        const isAdmin = req.isAdmin || false;
        
        if (!userID) {
            return res.status(500).json({
                err: "missing required 'userID' in request data"
            });
        }

        const portfolioID = req.params.id;

        if (!portfolioID) {
            return res.status(400).json({
                err: "missing required 'id' parameter"
            });
        }

        const result = await DeletePortfolio(userID, portfolioID, isAdmin);

        if (result.deletedCount === 0) {
            return res.status(404).json({
                err: 'not found',
            });
        }

        return res.status(204).end();
    } catch (e) {
        res.status(500).json({
            err: e.message,
        });
    }
});

export default portfolioController;
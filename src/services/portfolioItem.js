import fs from 'fs';

import ServiceError from '../errors/errors.js';
import PortfolioItemModel from '../models/portfolioitem.js';

async function CreatePortfolio(userID, data) { 
    try {
        const result = await PortfolioItemModel.create({
            user: userID,
            pictures: [],
            names: data.names,
            descriptions: data.descriptions,
        });

        return {
            id: result._id,
            user: result.userID,
            pictures: [],
            names: {
                ru: result.names.ru,
                en: result.names.en,
            },
            descriptions: {
                ru: result.descriptions.ru,
                en: result.descriptions.en,
            },
            timestamps: {
                creationDate: result.timestamps.creationDate,
                updateDate: result.timestamps.updateDate
            }
        };
    } catch (e) {
        if (e.name === 'ValidationError') {
            throw new ServiceError('validation error: ' + e.message, 400);
        } else {
            console.error('[!] create portfolio:', e);
            throw new Error('something went wrong... please try again later :)');
        }
    }
};

async function GetAllPortfolios(userID) {
    try {
        const result = await PortfolioItemModel.find({ user: userID });

        return result;
    } catch (e) {
        console.error('[!] get all portfolios:', e.message);
        throw new Error('something went wrong... please try again later :)');
    }
};

async function GetPortfolioByID(userID, portfolioID, isAdmin) {
    try {
        let query = { _id: portfolioID };
        if (!isAdmin) {
            query.user = userID;
        }

        const result = await PortfolioItemModel.findOne(query);

        return result;
    } catch (e) {
        console.error('[!] get portfolio by id:', e.message);
        throw new Error('something went wrong... please try again later :)');
    }
};

async function PushImageToPortfolio(userID, portfolioID, isAdmin, img) {
    try {
        let query = { _id: portfolioID };
        if (!isAdmin) {
            query.user = userID;
        }
        
        const result = await PortfolioItemModel.updateOne(query, {
            $push: {
                'pictures': img
            },
            $set: {
                'timestamps.updateDate': Date.now()
            }
        });

        return result;
    } catch (e) {
        console.error('[!] update portfolio:', e.message);
        throw new Error('something went wrong... please try again later :)');
    }
}

async function UpdatePortfolio(userID, portfolioID, isAdmin, data) {
    try {
        let query = { _id: portfolioID };
        if (!isAdmin) {
            query.user = userID;
        }
        
        const result = await PortfolioItemModel.updateOne(query, {
            $set: {
                ...data,
                'timestamps.updateDate': Date.now()
            }
        });

        return result;
    } catch (e) {
        console.error('[!] update portfolio:', e.message);
        throw new Error('something went wrong... please try again later :)');
    }
};

async function DeletePortfolio(userID, portfolioID, isAdmin) {
    try {
        let query = { _id: portfolioID };
        if (!isAdmin) {
            query.user = userID;
        }

        const result = await PortfolioItemModel.findOneAndDelete(query);

        const pictures = result.pictures;

        for (const pic of pictures) {
            fs.unlink('uploads/' + pic, (err) => {
                if (err) {
                    console.error('[x] failed to remove a file: ', err)
                } else {
                    console.log(`[!] ${pic} is deleted`)
                }
            });
        }

        return result;
    } catch (e) {
        console.error('[!] delete portfolio:', e.message);
        throw new Error('something went wrong... please try again later :)');
    }
};

export {
    CreatePortfolio,
    GetAllPortfolios,
    GetPortfolioByID,
    PushImageToPortfolio,
    UpdatePortfolio,
    DeletePortfolio
};
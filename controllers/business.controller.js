import path from 'path';
import Business from "../models/business.model.js"
import { getUserIdFromToken } from "../utils/getUserIdFromToken.js"
import responseHelper from "../helpers/responseHelper.js"
import { deleteImageWhileOnError } from "../helpers/deleteUploadedImageOnError.js";

export const createBusiness = async (req, res) => {
    console.log(req.body)
    try {
        const token = req.cookies.token;
        const userId = getUserIdFromToken(token);
        if (!userId) return responseHelper(res, 404, 'User not authenticated');

        const {
            businessName,
            businessType,
            owner,
            slug,
            businessPhoneNumber,
            businessAddress,
            openingHours,
            socialMedia,
        } = req.body;

        // Logo varsa kaydet
        const image = req.file ? path.posix.join('uploads', req.file.filename) : null;

        const existingBusiness = await Business.findOne({ $or: [{ businessName }, { slug }] });
        if (existingBusiness) {
            if (image) deleteImageWhileOnError(image);
            return responseHelper(res, 409, 'Business name or slug already exists.');
        }

        const business = await Business.create({
            userId,
            businessName,
            businessType,
            owner,
            slug,
            businessPhoneNumber,
            businessAddress,
            openingHours,
            socialMedia,
            image,
        });

        return responseHelper(res, 201, 'Business created successfully.', business);

    } catch (error) {
        console.error('Error creating business:', error);
        return responseHelper(res, 500, 'An error occurred while creating the business.', error.message);
    }
};

export const updateBusiness = async (req, res) => {
    console.log(req.body)
    try {
        const token = req.cookies.token;
        const userId = getUserIdFromToken(token);
        if (!userId) return responseHelper(res, 404, 'User not authenticated');

        const {
            businessId,
            businessName,
            businessType,
            owner,
            slug,
            businessPhoneNumber,
            businessAddress,
            openingHours,
            socialMedia,
        } = req.body;

        const business = await Business.findOne({ _id: businessId, userId });
        if (!business) return responseHelper(res, 404, 'Business not found.');

        // slug değeri güncellenmek isteniyorsa ve değişmişse
        if (slug && slug !== business.slug) {
            const existingSlug = await Business.findOne({ slug });
            if (existingSlug) return responseHelper(res, 409, 'Slug already in use.');
        }

        const updateData = {};

        if (typeof businessName !== 'undefined') updateData.businessName = businessName;
        if (typeof slug !== 'undefined') updateData.slug = slug;
        if (typeof businessType !== 'undefined') updateData.businessType = businessType;
        if (typeof owner !== 'undefined') updateData.owner = owner;
        if (typeof businessPhoneNumber !== 'undefined') updateData.businessPhoneNumber = businessPhoneNumber;
        if (typeof businessAddress !== 'undefined') updateData.businessAddress = businessAddress;
        if (typeof openingHours !== 'undefined') updateData.openingHours = openingHours;
        if (typeof socialMedia !== 'undefined') updateData.socialMedia = socialMedia;

        if (req.file) {
            const newLogo = path.posix.join('uploads', req.file.filename);
            updateData.image = newLogo;

            if (business.image) {
                deleteImageWhileOnError(business.image);
            }
        }

        const updatedBusiness = await Business.findByIdAndUpdate(
            businessId,
            { $set: updateData },
            { new: true }
        );

        return responseHelper(res, 200, 'Business updated successfully.', updatedBusiness);

    } catch (error) {
        console.error('Error updating business:', error);
        return responseHelper(res, 500, 'An error occurred while updating the business.', error.message);
    }
};

export const deleteBusiness = async (req, res) => {
    try {
        const { businessId } = req.body;
        const token = req.cookies.token;
        const userId = getUserIdFromToken(token);
        if (!userId) return responseHelper(res, 404, 'User not authenticated');

        const businessToDelete = await Business.findOne({ _id: businessId, userId });
        if (!businessToDelete) {
            return responseHelper(res, 404, 'Business not found.');
        }

        if (businessToDelete.image) {
            deleteImageWhileOnError(businessToDelete.image);
        }

        await Business.deleteOne({ _id: businessId });

        return responseHelper(res, 200, 'Business deleted successfully.');

    } catch (error) {
        console.error('Error deleting business:', error);
        return responseHelper(res, 500, 'An error occurred while deleting the business.', error.message);
    }
};

export const getBusinessByUserId = async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = getUserIdFromToken(token);
        if (!userId) return responseHelper(res, 404, 'User not authenticated');

        const businesses = await Business.findOne({ userId });
        if (!businesses || businesses.length === 0) return responseHelper(res, 404, 'No businesses found for this user.');

        return responseHelper(res, 200, 'Businesses retrieved successfully.', businesses);

    } catch (error) {
        console.error('Error retrieving businesses:', error);
        return responseHelper(res, 500, 'An error occurred while retrieving the businesses.', error.message);
    }
};

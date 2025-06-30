import { body } from 'express-validator';

const businessTypes = ['restaurant', 'cafe', 'bar', 'fastfood', 'bakery', 'bistro', 'pub', 'dessert', 'other'];

export const createBusinessValidation = [
    body("image")
        .optional()
        .isString().withMessage("Geçerli bir logo URL’si girin.")
        .trim(),

    body('businessName')
        .optional()
        .isString().withMessage("Geçerli bir işletme adı girin.")
        .trim().toLowerCase(),

    body('slug')
        .notEmpty().withMessage("QR Menü adresini boş bırakmayın.")
        .isString().withMessage("Geçerli bir QR Menü adresi girin.")
        .trim()
        .toLowerCase()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage("QR Menü adresi sadece küçük harfler, rakamlar ve tire (-) içerebilir, boşluk veya özel karakter olmamalıdır."),

    body('businessType')
        .optional()
        .isString().withMessage("Geçerli bir işletme türü girin.")
        .trim().toLowerCase()
        .isIn(businessTypes).withMessage(`İşletme türü şu değerlerden biri olmalı: ${businessTypes.join(', ')}`),

    body('owner.name')
        .optional()
        .isString().withMessage("Geçerli bir ad girin.")
        .trim().toLowerCase(),

    body('owner.phoneNumber')
        .optional()
        .isMobilePhone().withMessage("Geçerli bir telefon numarası girin."),

    body('businessPhoneNumber')
        .optional()
        .isMobilePhone().withMessage("Geçerli bir telefon numarası girin."),

    body('businessAddress.street')
        .optional()
        .isString().withMessage("Geçerli bir sokak adı girin.")
        .trim().toLowerCase(),

    body('businessAddress.city')
        .optional()
        .isString().withMessage("Geçerli bir şehir adı girin.")
        .trim().toLowerCase(),

    body('businessAddress.district')
        .optional()
        .isString().withMessage("Geçerli bir ilçe adı girin.")
        .trim().toLowerCase(),

    body('businessAddress.zipCode')
        .optional()
        .isPostalCode('any').withMessage("Geçerli bir posta kodu girin."),

    body('businessAddress.country')
        .optional()
        .isString().withMessage("Geçerli bir ülke adı girin.")
        .trim().toLowerCase(),

    body('openingHours')
        .optional()
        .matches(/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/)
        .withMessage('Çalışma saatleri "09:00-22:00" formatında olmalıdır.'),

    body('socialMedia.instagram')
        .optional()
        .isURL().withMessage('Geçerli bir Instagram bağlantısı girin.'),

    body('socialMedia.facebook')
        .optional()
        .isURL().withMessage('Geçerli bir Facebook bağlantısı girin.'),


    body('socialMedia.whatsapp')
        .optional()
        .isMobilePhone().withMessage('Geçerli bir WhatsApp numarası girin.'),

    body('socialMedia.x')
        .optional()
        .isURL().withMessage('Geçerli bir X bağlantısı girin.'),

    body('socialMedia.website')
        .optional()
        .isURL().withMessage('Geçerli bir web sitesi bağlantısı girin.'),
];


export const updateBusinessValidation = [
    body("image")
        .optional()
        .custom((value, { req }) => {
            if (!req.file) return true;
            const fileSize = req.file.size;
            const maxSize = 10 * 1024 * 1024;
            if (fileSize > maxSize) {
                throw new Error("Logo must be less than 10MB.");
            }
            return true;
        }),

    body('businessName').optional().isString().trim().notEmpty().withMessage('Business name cannot be empty if provided.').toLowerCase(),
    body('slug')
        .notEmpty().withMessage("QR Menü adresini boş bırakmayın.")
        .isString().withMessage("Geçerli bir QR Menü adresi girin.")
        .trim()
        .toLowerCase()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage("QR Menü adresi sadece küçük harfler, rakamlar ve tire (-) içerebilir, boşluk veya özel karakter olmamalıdır."),
    body('businessType').optional().isString().trim().toLowerCase().isIn(businessTypes).withMessage(`Business type must be one of: ${businessTypes.join(', ')}`),

    body('owner.name').optional().isString().trim().notEmpty().withMessage('Owner name cannot be empty if provided.').toLowerCase(),
    body('owner.phoneNumber').optional().isMobilePhone().withMessage('Invalid owner phone number.'),

    body('businessPhoneNumber').optional().isMobilePhone().withMessage('Invalid business phone number.'),

    body('businessAddress.street').optional().isString().trim().notEmpty().withMessage('Street address cannot be empty if provided.').toLowerCase(),
    body('businessAddress.city').optional().isString().trim().notEmpty().withMessage('City cannot be empty if provided.').toLowerCase(),
    body('businessAddress.district').optional().isString().trim().toLowerCase(),
    body('businessAddress.zipCode').optional().isPostalCode('any').withMessage('Invalid zip code.'),
    body('businessAddress.country').optional().isString().trim().toLowerCase(),

    body('openingHours').optional().isString().withMessage('Opening hours must be a string in format "09:00-22:00"'),

    body('socialMedia.instagram').optional().isURL().withMessage('Instagram link must be a valid URL.'),
    body('socialMedia.facebook').optional().isURL().withMessage('Facebook link must be a valid URL.'),
    body('socialMedia.whatsapp').optional().isMobilePhone().withMessage('Invalid WhatsApp number.'),
    body('socialMedia.x').optional().isURL().withMessage('X (Twitter) link must be a valid URL.'),
    body('socialMedia.website').optional().isURL().withMessage('Website must be a valid URL.'),

]


export const deleteBusinessValidation = [
    body('businessId')
        .notEmpty().withMessage('Business ID is required.')
        .isMongoId().withMessage('Invalid Business ID.')
];

export const getBusinessValidation = [
    body('businessId')
        .notEmpty()
        .withMessage('Business ID is required.')
        .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid Business ID.');
            }
            return true;
        }),

];

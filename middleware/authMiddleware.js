const Post = require('../models/Post');

// בדיקה שהמשתמש מחובר (מגן על נתיבים)
exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ error: 'גישה דחוקה: יש להתחבר למערכת' });
};

// הרשאה: בדיקה שהמשתמש הוא בעלי הפוסט לפני עריכה/מחיקה
exports.isPostOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ error: 'הפוסט לא נמצא' });
        }

        const userId = req.session?.user?._id || req.body.userId; // תמיכה בסשן או מזהה שנשלח
        if (post.author.toString() !== userId?.toString()) {
            return res.status(403).json({ error: 'הרשאה נדחתה: ניתן לערוך/למחוק רק פוסטים שנוצרו על ידך' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בבדיקת הרשאות' });
    }
};
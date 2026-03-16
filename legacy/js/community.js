/**
 * NutriVision AI - Community Intelligence Feed
 * Simulates enterprise social sharing of health achievements.
 */

class CommunityEngine {
    constructor() {
        this.posts = this._getInitialPosts();
    }

    _getInitialPosts() {
        return [
            { id: 1, user: 'Sarah Miller', avatar: 'SM', meal: 'Avocado Salad', stats: '420 kcal | 15g P', likes: 24, time: '2m ago' },
            { id: 2, user: 'Michael Chen', avatar: 'MC', meal: 'Matcha Bowl', stats: '180 kcal | 5g P', likes: 12, time: '15m ago' },
            { id: 3, user: 'Dr. Emily Watson', avatar: 'EW', meal: 'Grilled Tofu', stats: '290 kcal | 22g P', likes: 68, time: '1h ago', verified: true }
        ];
    }

    getFeed() {
        return this.posts;
    }

    shareMeal(mealName, macros) {
        const newPost = {
            id: Date.now(),
            user: 'James Doe', // Current Session User
            avatar: 'JD',
            meal: mealName,
            stats: macros,
            likes: 0,
            time: 'Just now'
        };
        this.posts.unshift(newPost);
        return newPost;
    }
}

export const community = new CommunityEngine();
export default community;

/**
 * AABB (Axis-Aligned Bounding Box) 方式での当たり判定
 * @param {Object} obj1 
 * @param {Object} obj2 
 * @returns {boolean} 衝突している場合は true
 */
export function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}

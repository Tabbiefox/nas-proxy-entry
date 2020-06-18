/**
 * Check if the specified variable is an object and nothing else
 *
 * @param v Variable to check
 * @returns Boolean
 */
export function isObject(v: any): boolean {
    return Object.prototype.toString.call(v) === '[object Object]';
}

/**
 * Check if the specified variable is empty
 *
 * @param v Variable to check
 * @returns Boolean
 */
export function isEmpty(v: object | any[]): boolean {
    return !Object.keys(v).length;
}

/**
 *
 */
export function equals(obj1: any, obj2: any, field ?: string): boolean {
    if (field)
        return (resolveFieldData(obj1, field) === resolveFieldData(obj2, field));
    else
        return equalsByValue(obj1, obj2);
}

/**
 *
 */
export function equalsByValue(obj1: any, obj2: any, visited ?: any[]): boolean {
    if (obj1 == null && obj2 == null) {
        return true;
    }
    if (obj1 == null || obj2 == null) {
        return false;
    }

    if (obj1 == obj2) {
        return true;
    }

    if (typeof obj1 == 'object' && typeof obj2 == 'object') {
        if (visited) {
            if (visited.indexOf(obj1) !== -1) return false;
        } else {
            visited = [];
        }
        visited.push(obj1);

        for (var p in obj1) {
            if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) {
                return false;
            }

            switch (typeof (obj1[p])) {
                case 'object':
                    if (!equalsByValue(obj1[p], obj2[p], visited)) return false;
                    break;

                case 'function':
                    if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
                    break;

                default:
                    if (obj1[p] != obj2[p]) return false;
                    break;
            }
        }

        for (var p in obj2) {
            if (typeof (obj1[p]) == 'undefined') return false;
        }

        delete obj1._$visited;
        return true;
    }

    return false;
}

/**
 *
 */
export function resolveFieldData(data: any, field: string): any {
    if (data && field) {
        if (field.indexOf('.') == -1) {
            return data[field];
        }
        else {
            let fields: string[] = field.split('.');
            let value = data;
            for (var i = 0, len = fields.length; i < len; ++i) {
                if (value == null) {
                    return null;
                }
                value = value[fields[i]];
            }
            return value;
        }
    }
    else {
        return null;
    }
}

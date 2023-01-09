const objectClassType = Symbol("object class type");
const relationshipClassType = Symbol("object class type");

function interpretClassTypeId(typeId) {
    switch (typeId) {
        case 1:
            return objectClassType;
        case 2:
            return relationshipClassType;
        default:
            throw Error("Unknown entity class type id");
    }
}

export {
    interpretClassTypeId,
    objectClassType,
    relationshipClassType,
}

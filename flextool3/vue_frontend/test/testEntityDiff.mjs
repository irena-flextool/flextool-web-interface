import assert from "assert/strict";
import {EntityDiff} from "../src/modules/entityDiff.mjs";

function makeEmptyCommitData() {
    return {
        class_id: 1,
        insertions: {
            object: [],
            relationship: [],
            parameter_value: [],
        },
        updates: {
            object: [],
            relationship: [],
            parameter_value: [],
        },
        deletions: {
            object: [],
            relationship: [],
            parameter_value: [],
        }
    };
}

describe("EntityDiff", function() {
    describe("isPending", function() {
        it("should return false initially", function() {
            const diff = new EntityDiff(1, "my_class");
            assert.equal(diff.isPending(), false);
        });
    });
    describe("makeCommitData", function() {
        it("should generate empty commit data initially", function() {
            const diff = new EntityDiff(1, "my_class");
            assert.deepEqual(diff.makeCommitData(), makeEmptyCommitData());
        });
        it("should convert semi-value Map to actual Map", function() {
            const diff = new EntityDiff(1, "my_class");
            const semiValue = {
                index_name: "idx_x",
                content: "T1 11.0\n" + "T2 22.0\n"
            };
            diff.insertValue(semiValue, "my_object", 5, 6);
            const expected = makeEmptyCommitData();
            expected.insertions.parameter_value.push({
                entity_name: "my_object",
                definition_id: 5,
                alternative_id: 6,
                value: {
                    type: "map",
                    index_type: "str",
                    index_name: "idx_x",
                    data: [["T1", 11.0], ["T2", 22.0]]
                }
            });
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should convert semi-value Array to actual Array", function() {
            const diff = new EntityDiff(1, "my_class");
            const semiValue = {
                index_name: "idx_x",
                content: "11.0\n" + "22.0\n"
            };
            diff.insertValue(semiValue, "my_object", 5, 6);
            const expected = makeEmptyCommitData();
            expected.insertions.parameter_value.push({
                entity_name: "my_object",
                definition_id: 5,
                alternative_id: 6,
                value: {
                    type: "array",
                    value_type: "float",
                    data: [11.0, 22.0]
                }
            });
            assert.deepEqual(diff.makeCommitData(), expected);
        });
    });
    describe("insertEntity", function() {
        it("should generate correct commit data when single object is inserted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertEntity("my_object", 1);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.insertions.object.push({name: "my_object"});
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should generate correct commit data when single relationship is inserted", function() {
            const diff = new EntityDiff(1, "class_name");
            diff.insertEntity(["my_object_1", "my_object_2"], 1);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.insertions.relationship.push({
                name: "class_name_my_object_1__my_object_2",
                object_name_list: ["my_object_1", "my_object_2"]
            });
            assert.deepEqual(diff.makeCommitData(), expected);
        });
    });
    describe("updateEntity", function() {
        it("should generate correct commit data when existing object is renamed", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.updateEntity("original", 23, "new_name");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.updates.object.push({id: 23, name: "new_name"});
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should generate insert only commit data when uncommitted object is renamed", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertEntity("original_name", 1);
            diff.updateEntity("original_name", undefined, "new_name");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.insertions.object.push({name: "new_name"});
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should generate value commit data also when existing object is renamed after value update", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.updateValue("yes", 7, "my_object", 5, 6);
            diff.updateEntity("original", 23, "new_name");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.updates.object.push({id: 23, name: "new_name"});
            expected.updates.parameter_value.push({id: 7, value: "yes"});
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should generate correct commit data when existing relationship is changed", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.updateEntity(["object_1", "object_2"], 23, ["object_3", "object_4"]);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.updates.relationship.push({
                id: 23,
                name: "my_class_object_3__object_4",
                object_name_list: ["object_3", "object_4"]
                });
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should generate insert only commit data when uncommitted relationship is changed", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertEntity(["object_1", "object_2"], 1);
            diff.updateEntity(["object_1", "object_2"], undefined, ["object_3", "object_4"]);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.insertions.relationship.push({
                name: "my_class_object_3__object_4",
                object_name_list: ["object_3", "object_4"]
                });
            assert.deepEqual(diff.makeCommitData(), expected);
        });
    });
    describe("deleteEntity", function() {
        it("should generate correct commit data when existing object is deleted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.deleteEntity(23, "my_object");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.deletions.object.push(23);
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should remove pending data completely when uncommitted object is deleted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertEntity("my_object", 1);
            diff.deleteEntity(undefined, "my_object");
            assert.equal(diff.isPending(), false);
            assert.deepEqual(diff.makeCommitData(), makeEmptyCommitData());
        });
        it("should replace update by deletion when renamed object gets deleted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.updateEntity("original_name", 23, "my_object");
            diff.deleteEntity(23, "my_object");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.deletions.object.push(23);
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should drop all commit data when uncommitted object with inserted value gets deleted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertEntity("my_object", 1)
            diff.insertValue("yes", "my_object", 5, 6);
            diff.deleteEntity(undefined, "my_object");
            assert.equal(diff.isPending(), false);
            assert.deepEqual(diff.makeCommitData(), makeEmptyCommitData());
        });
        it("should drop value update when existing object with updated value gets deleted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.updateValue("yes", 7, "my_object", 5, 6);
            diff.deleteEntity(23, "my_object");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.deletions.object.push(23);
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should generate correct commit data when existing relationship is deleted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.deleteEntity(23, ["object_1"]);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.deletions.object.push(23);
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should remove pending data completely when uncommitted relationship is deleted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertEntity(["object_1"], 1);
            diff.deleteEntity(undefined, ["object_1"]);
            assert.equal(diff.isPending(), false);
            assert.deepEqual(diff.makeCommitData(), makeEmptyCommitData());
        });
    });
    describe("insertValue", function() {
        it("should generate correct commit data when value for existing object is inserted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertValue("yes", "my_object", 5, 6);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.insertions.parameter_value.push({
                entity_name: "my_object",
                definition_id: 5,
                alternative_id: 6,
                value: "yes"
            });
            assert.deepEqual(diff.makeCommitData(), expected);
        });
    });
    describe("updateValue", function() {
        it("should generate correct commit data when existing value is updated", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.updateValue("yes", 7, "my_object", 5, 6);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.updates.parameter_value.push({id: 7, value: "yes"});
            assert.deepEqual(diff.makeCommitData(),expected);
        });
        it("should generate insertion commit data when uncommitted value is updated", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertValue("yes", "my_object", 5, 6);
            diff.updateValue("no", undefined, "my_object", 5, 6);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.insertions.parameter_value.push({
                entity_name: "my_object",
                definition_id: 5,
                alternative_id: 6,
                value: "no"
            });
            assert.deepEqual(diff.makeCommitData(), expected);
        });
    });
    describe("deleteValue", function() {
        it("should generate correct commit data when existing value is deleted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.deleteValue(7, "my_object", 5, 6);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.deletions.parameter_value.push(7);
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should generate empty commit data when uncommitted value is deleted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertValue("yes", "my_object", 5, 6)
            assert.equal(diff.isPending(), true);
            diff.deleteValue(undefined, "my_object", 5, 6);
            assert.equal(diff.isPending(), false);
            assert.deepEqual(diff.makeCommitData(), makeEmptyCommitData());
        });
    });
    describe("pendingValue", function() {
        it("should return the value when it has been inserted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertValue("yes", "my_object", 5, 6);
            assert.equal(diff.pendingValue("my_object", 5, 6), "yes");
        });
        it("should return the value when it has been updated", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.updateValue("yes", 7, "my_object", 5, 6);
            assert.equal(diff.pendingValue("my_object", 5, 6), "yes");
        });
        it("should return undefined when entity name does not match", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertValue("yes", "my_object", 5, 6);
            assert.equal(diff.pendingValue("non_existent_object", 5, 6), undefined);
        });
        it("should return undefined when parameter definition id does not match", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertValue("yes", "my_object", 5, 6);
            assert.equal(diff.pendingValue("my_object", 99, 6), undefined);
        });
        it("should return undefined when alternative id does not match", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertValue("yes", "my_object", 5, 6);
            assert.equal(diff.pendingValue("my_object", 5, 99), undefined);
        });
        it("should return the value for relationship when it has been inserted", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.insertValue("yes", ["object1", "object_2"], 5, 6);
            assert.equal(diff.pendingValue(["object1", "object_2"], 5, 99), undefined);
        });
    });
    describe("isPendingDeletion", function() {
        it("should return true when value is pending deletion", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.deleteValue(7, "my_object", 5, 6);
            assert.equal(diff.isPendingDeletion("my_object", 5, 6), true);
        });
        it("should return false when no value is pending deletion", function() {
            const diff = new EntityDiff(1, "my_class");
            assert.equal(diff.isPendingDeletion("my_object", 5, 6), false);
        });
        it("should return false when no value for given object is pending deletion", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.deleteValue(7, "my_object", 5, 6);
            assert.equal(diff.isPendingDeletion("other_object", 5, 6), false);
        });
        it("should return false when no value for given parameter definition is pending deletion", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.deleteValue(7, "my_object", 5, 6);
            assert.equal(diff.isPendingDeletion("my_object", 99, 6), false);
        });
        it("should return false when no value for given alternative is pending deletion", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.deleteValue(7, "my_object", 5, 6);
            assert.equal(diff.isPendingDeletion("my_object", 5, 99), false);
        });
        it("should return true when relationship's value for is pending deletion", function() {
            const diff = new EntityDiff(1, "my_class");
            diff.deleteValue(7, ["object_1", "object_2"], 5, 6);
            assert.equal(diff.isPendingDeletion(["object_1", "object_2"], 5, 6), true);
        });
    });
});

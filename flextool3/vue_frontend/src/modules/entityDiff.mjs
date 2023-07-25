import { singleValueFromString } from './singleValueFromString.mjs'
import { emblemToName, relationshipName } from './entityEmblem.mjs'

const insert = Symbol('insert action')
const del = Symbol('delete action')
const update = Symbol('update action')

/**Store for uncommitted changes to objects.*/
class PendingEntity {
  /**
   * @param {Symbol} action Commit action.
   */
  constructor(action = undefined) {
    this.action = action
    this.parameters = new Map()
  }
}

/**
 * Gets pending object's alternatives Map or creates a new one if it doesn't exist yet.
 * @param {PendingEntity} pendingObject Pending object.
 * @param {number} definitionId Parameter definition's id.
 * @returns {Map} Alternatives Map.
 */
function getAlternatives(pendingObject, definitionId) {
  let alternatives = pendingObject.parameters.get(definitionId)
  if (alternatives === undefined) {
    alternatives = new Map()
    pendingObject.parameters.set(definitionId, alternatives)
  }
  return alternatives
}

/**
 * Converts semi-values to values.
 * @param value Parameter value.
 * @return Value.
 */
function semiValueToValue(value) {
  if (typeof value !== 'object' || !('content' in value)) {
    return value
  }
  const data = []
  value.content.split('\n').forEach(function (line) {
    line = line.trim()
    if (!line) {
      return
    }
    const columns = line.split(/\s+/)
    if (columns.length === 1) {
      data.push(singleValueFromString(columns[0]))
    } else {
      data.push([columns[0], singleValueFromString(columns[1])])
    }
  })
  if (!data || data[0].length > 1) {
    return {
      type: 'map',
      index_type: 'str',
      index_name: value.index_name,
      data: data
    }
  } else {
    return {
      type: 'array',
      value_type: typeof data[0] === 'number' ? 'float' : 'str',
      data: data
    }
  }
}

/**Store for uncommitted changes to entities and parameter values.*/
class EntityDiff {
  #classId
  #className
  #pendingEntities

  /**
   * @param (number) classId Entity class id.
   * @param (string) className Entity class name.
   */
  constructor(classId, className) {
    this.#classId = classId
    this.#className = className
    this.#pendingEntities = new Map()
  }

  /**
   * Creates commit data for server.
   * @returns {Object} commit data
   */
  makeCommitData() {
    const objectInsertions = []
    const objectUpdates = []
    const objectDeletions = []
    const relationshipInsertions = []
    const relationshipUpdates = []
    const relationshipDeletions = []
    const valueInsertions = []
    const valueUpdates = []
    const valueDeletions = []
    this.#pendingEntities.forEach(function (pending, entityName) {
      const action = pending.action
      if (action) {
        if (action.action === insert) {
          if (action.objectNames === undefined) {
            objectInsertions.push({ name: action.name })
          } else {
            relationshipInsertions.push({ name: action.name, object_name_list: action.objectNames })
          }
        } else if (action.action === update) {
          if (action.objects === undefined) {
            objectUpdates.push({ id: action.id, name: action.name })
          } else {
            relationshipUpdates.push({
              id: action.id,
              name: action.name,
              object_name_list: action.objects
            })
          }
        } else if (action.action === del) {
          objectDeletions.push(action.id)
          return
        } else {
          throw new Error('Unknown object action.')
        }
      }
      pending.parameters.forEach(function (alternatives, definitionId) {
        alternatives.forEach(function (valueAction, alternativeId) {
          if (valueAction.action === insert) {
            valueInsertions.push({
              entity_name: entityName,
              definition_id: definitionId,
              alternative_id: alternativeId,
              value: semiValueToValue(valueAction.value)
            })
          } else if (valueAction.action === update) {
            valueUpdates.push({
              id: valueAction.id,
              value: semiValueToValue(valueAction.value)
            })
          } else if (valueAction.action === del) {
            valueDeletions.push(valueAction.id)
          }
        })
      })
    })
    return {
      class_id: this.#classId,
      insertions: {
        object: objectInsertions,
        relationship: relationshipInsertions,
        parameter_value: valueInsertions
      },
      updates: {
        object: objectUpdates,
        relationship: relationshipUpdates,
        parameter_value: valueUpdates
      },
      deletions: {
        object: objectDeletions,
        relationship: relationshipDeletions,
        parameter_value: valueDeletions
      }
    }
  }

  /**
   * Checks if there are uncommitted changes.
   * @returns {boolean} true if there are uncommitted changes, false otherwise.
   */
  isPending() {
    return this.#pendingEntities.size > 0
  }

  /** Resets uncommitted changes. */
  clearPending() {
    this.#pendingEntities.clear()
  }

  /**
   * Gets pending entity under given name or creates new one if it doesn't exist yet.
   * @param {(string|string[])} emblem Entity's emblem.
   * @returns {PendingEntity} Existing or new pending emblem.
   */
  getPendingEntity(emblem) {
    const name = emblemToName(this.#className, emblem)
    let pendingEntity = this.#pendingEntities.get(name)
    if (pendingEntity === undefined) {
      pendingEntity = new PendingEntity()
      this.#pendingEntities.set(name, pendingEntity)
    }
    return pendingEntity
  }

  /**
   * Inserts a new entity.
   * @param {(string|string[])} emblem Entity's emblem.
   */
  insertEntity(emblem) {
    if (typeof emblem === 'string') {
      this.#pendingEntities.set(emblem, new PendingEntity({ action: insert, name: emblem }))
    } else {
      const name = relationshipName(this.#className, emblem)
      this.#pendingEntities.set(
        name,
        new PendingEntity({
          action: insert,
          name: name,
          objectNames: emblem
        })
      )
    }
  }

  /**
   * Renames an entity.
   * @param {(string|string[])} previousEmblem Entity's previous emblem.
   * @param {number} id Entity's id if it exists.
   * @param {(string, string[])} emblem Entity's new emblem.
   */
  updateEntity(previousEmblem, id, emblem) {
    const isNoOperationOrUpdate = function (action, name) {
      return action === undefined || (action.action === update && name !== action.originalName)
    }
    if (typeof emblem === 'string') {
      const pending = this.#pendingEntities.get(previousEmblem)
      if (pending === undefined) {
        this.#pendingEntities.set(
          emblem,
          new PendingEntity({ action: update, id: id, name: emblem, originalName: previousEmblem })
        )
      } else {
        if (isNoOperationOrUpdate(pending.action, emblem)) {
          pending.action = {
            action: update,
            id: id,
            name: emblem,
            originalName: pending.action.originalName
          }
        } else if (pending.action.action === insert) {
          pending.action.name = emblem
        }
      }
    } else {
      const previousName = relationshipName(this.#className, previousEmblem)
      const name = relationshipName(this.#className, emblem)
      const pending = this.#pendingEntities.get(previousName)
      if (pending === undefined) {
        this.#pendingEntities.set(
          name,
          new PendingEntity({
            action: update,
            id: id,
            name: name,
            objects: emblem,
            originalName: previousName,
            originalObjects: previousEmblem
          })
        )
      } else {
        if (isNoOperationOrUpdate(pending.action, name)) {
          pending.action = {
            action: update,
            id: id,
            name: name,
            objects: emblem,
            originalName: previousName,
            originalEmblem: previousEmblem
          }
        } else if (pending.action.action === insert) {
          pending.action.name = name
          pending.action.objectNames = emblem
        }
      }
    }
  }

  /**
   * Deletes an entity.
   * @param {number} id Entity's id if it exists.
   * @param {string, string[]} emblem Entity's emblem.
   */
  deleteEntity(id, emblem) {
    const name = emblemToName(this.#className, emblem)
    const pending = this.#pendingEntities.get(name)
    if (pending === undefined) {
      this.#pendingEntities.set(name, new PendingEntity({ action: del, id: id }))
    } else {
      if (pending.action === undefined || pending.action.action !== insert) {
        pending.action = { action: del, id: id }
        pending.parameters.clear()
      } else {
        this.#pendingEntities.delete(name)
      }
    }
  }

  /**
   * Inserts a parameter value.
   * @param value Parameter's value.
   * @param {(string|string[]} entityEmblem entityEmblem Entity's emblem.
   * @param {number} definitionId Parameter definition's id.
   * @param {number} alternativeId Alternative's id.
   */
  insertValue(value, entityEmblem, definitionId, alternativeId) {
    const entityName = emblemToName(this.#className, entityEmblem)
    const pendingEntity = this.getPendingEntity(entityName)
    const valueAction = {
      action: insert,
      entity_name: entityName,
      definition_id: definitionId,
      alternative_id: alternativeId,
      value: value
    }
    const alternatives = getAlternatives(pendingEntity, definitionId)
    alternatives.set(alternativeId, valueAction)
  }

  /**
   * Updates a parameter value.
   * @param value Parameter's value.
   * @param {number} id Parameter's id.
   * @param {(string|string[])} entityEmblem entityEmblem Entity's emblem.
   * @param {number} definitionId Parameter definition's id.
   * @param {number} alternativeId Alternative's id.
   */
  updateValue(value, id, entityEmblem, definitionId, alternativeId) {
    const pendingEntity = this.getPendingEntity(entityEmblem)
    const alternatives = getAlternatives(pendingEntity, definitionId)
    let valueAction = undefined
    if (id === undefined) {
      valueAction = {
        action: insert,
        entity_name: emblemToName(this.#className, entityEmblem),
        definition_id: definitionId,
        alternative_id: alternativeId,
        value: value
      }
    } else {
      valueAction = {
        action: update,
        id: id,
        value: value
      }
    }
    alternatives.set(alternativeId, valueAction)
  }

  /**
   * Deletes a parameter value.
   * @param {number} id Parameter's id.
   * @param {(string|string[])} entityEmblem entityEmblem Entity's emblem.
   * @param {number} definitionId Parameter definition's id.
   * @param {number} alternativeId Alternative's id.
   */
  deleteValue(id, entityEmblem, definitionId, alternativeId) {
    const pendingEntity = this.getPendingEntity(entityEmblem)
    const alternatives = getAlternatives(pendingEntity, definitionId)
    if (id === undefined) {
      alternatives.delete(alternativeId)
      if (alternatives.size === 0) {
        pendingEntity.parameters.delete(definitionId)
        if (pendingEntity.parameters.size === 0 && pendingEntity.action === undefined) {
          this.#pendingEntities.delete(entityEmblem)
        }
      }
    } else {
      alternatives.set(alternativeId, { action: del, id: id })
    }
  }

  /**
   * Returns pending parameter value if it exists.
   * @param {(string|string[])} entityEmblem Entity's name.
   * @param {number} definitionId Parameter definition's id.
   * @param {number} alternativeId Alternative's id.
   * @returns {*} Parameter's value or undefined if not found.
   */
  pendingValue(entityEmblem, definitionId, alternativeId) {
    const entityName = emblemToName(this.#className, entityEmblem)
    const pendingEntity = this.#pendingEntities.get(entityName)
    if (pendingEntity === undefined) {
      return undefined
    }
    const alternatives = pendingEntity.parameters.get(definitionId)
    if (alternatives === undefined) {
      return undefined
    }
    const valueAction = alternatives.get(alternativeId)
    return valueAction !== undefined ? valueAction.value : undefined
  }

  /**
   * Returns true if given parameter value is pending deletion.
   * @param {(string|string[])} entityEmblem Entity's name.
   * @param {number} definitionId Parameter definition's id.
   * @param {number} alternativeId Alternative's id.
   * @returns {boolean} True if value is pending deletion, false otherwise.
   */
  isPendingDeletion(entityEmblem, definitionId, alternativeId) {
    const entityName = emblemToName(this.#className, entityEmblem)
    const pendingEntity = this.#pendingEntities.get(entityName)
    if (pendingEntity === undefined) {
      return false
    }
    const alternatives = pendingEntity.parameters.get(definitionId)
    if (alternatives === undefined) {
      return false
    }
    const valueAction = alternatives.get(alternativeId)
    return valueAction !== undefined && alternatives.get(alternativeId).action === del
  }
}

export { EntityDiff }

//GameOverCollider.js
import * as ecs from '@8thwall/ecs'  // This is how you access the ecs library

ecs.registerComponent({
    name: 'gameOverCollider',
    schema: {
        characterContainer: ecs.eid,  // Character Container entity reference via its entity ID
        gameManager: ecs.eid,  // Game Manager entity reference via its entity ID
    },
    // Defining the state machine
    stateMachine: ({world, eid, schemaAttribute}) => {
        // creating the initial state
        ecs.defineState('default').initial()
            .onEnter(() => {
                // The event reference contains info about the collision
                world.events.addListener(eid, ecs.physics.COLLISION_START_EVENT, (event) => {
                    // If the other entity colliding with this one is the Character Container
                    if (schemaAttribute.get(eid).characterContainer === event.data.other) {
                        // Emit the 'gameOver' event from the Game Manager
                        world.events.dispatch(eid, 'gameOver')
                    }
                })
            })
            .onExit(() => {
                // remove event listener
                world.events.removeListener(eid, ecs.physics.COLLISION_START_EVENT, (event) => {
                    if (schemaAttribute.get(eid).characterContainer === event.data.other) {
                        world.events.dispatch(eid, 'gameOver')
                    }
                })
            })
    },
})

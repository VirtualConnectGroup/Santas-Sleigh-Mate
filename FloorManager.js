//FloorManager.js
import * as ecs from '@8thwall/ecs'  // This is how you access the ecs library

// Floor Manager Component
// Handles floor collisions
ecs.registerComponent({
    name: 'floorManager',
    schema: {
        characterContainer: ecs.eid,  // Character Container entity reference via its entity ID
    },
    stateMachine: ({world, eid, schemaAttribute}) => {
        ecs.defineState('inAir').initial()  // creating the initial state
            // creating event to transition state to grounded
            .onEvent(ecs.physics.COLLISION_START_EVENT, 'grounded',
                {
                    beforeTransition: event => schemaAttribute.cursor(eid).characterContainer !==
                        event.data.other,
                })
            .onExit(() => world.events.dispatch(eid, 'onFloor'))  // dispatch onFloor event

        ecs.defineState('grounded')
            // creating event to transition state to inAir
            .onEvent(ecs.physics.COLLISION_END_EVENT, 'inAir',
                {
                    beforeTransition: event => schemaAttribute.cursor(eid).characterContainer !==
                        event.data.other,
                })
            .onExit(() => world.events.dispatch(eid, 'offFloor'))  // dispatch offFloor event
    },
})

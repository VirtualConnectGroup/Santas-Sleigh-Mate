// ObstacleController.js
import * as ecs from '@8thwall/ecs'  // This is how you access the ecs library

// Obstacle Controller Component
// Handles control of randomizing and moving obstacles toward the player
ecs.registerComponent({
    name: 'obstacleController',
    schema: {
        obstacleMoveSpeed: ecs.f32,  // Obstacle Movement Speed as a 32-bit floating point number
        leftBound: ecs.f32,  // The initial Left Bound x value as a 32-bit floating point number
        maxHeight: ecs.f32,  // The Max Height the obstacles can spawn as a 32-bit floating point number
        minHeight: ecs.f32,  // The Min Height the obstacles can spwan as a 32-bit floating point number
    },
    schemaDefaults: {
        obstacleMoveSpeed: 9,
        leftBound: -32,
        maxHeight: 5,
        minHeight: -6,
    },
    data: {
        numObstacles: ecs.f32,  // number of obstacles that are children of the entity
        gameActive: ecs.boolean,  // Flag for whether the game is in the active state
    },
    stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
        const {maxHeight, minHeight} = schemaAttribute.get(eid)
        ecs.defineState('inGame')  // creating the inGame state
            // listening for restart on world.events.globalId to transition to moving state
            .onEvent('gameOver', 'finishGame', {target: world.events.globalId})
            .onExit(() => {
                dataAttribute.cursor(eid).gameActive = false
            })
        ecs.defineState('start').initial()  // creating the initial state
            // listening for gameOver on world.events.globalId to transition to paused state
            .onEvent('startGame', 'inGame', {target: world.events.globalId})
            .onExit(() => {
                dataAttribute.cursor(eid).gameActive = true
            })
        ecs.defineState('finishGame')  // creating the finish state
            // listening for gameOver on world.events.globalId to transition to paused state
            .onEvent('restart', 'start', {target: world.events.globalId})
            .onExit(() => {
                const offset = schemaAttribute.cursor(eid).leftBound /
                    dataAttribute.cursor(eid).numObstacles
                let yPosition
                let index = 0
                for (const element of world.getChildren(eid)) {
                    const xPosition = index * offset  // Evenly space out each obstacle position
                    // Randomize the y within the upper and lower bounds
                    yPosition = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight)
                    world.setPosition(element, -xPosition, yPosition, 0)  // Set its final position
                    index++
                }
            })
    },
    add: (world, component) => {
        component.dataAttribute.cursor(component.eid).gameActive = false
        // Initialize Data
        component.dataAttribute.cursor(component.eid).numObstacles = 0
        // count the children
        for (const eid of world.getChildren(component.eid)) {
            component.dataAttribute.cursor(component.eid).numObstacles += 1
        }
    },
    tick: (world, component) => {
        // Division by 1000 to change to seconds. i.e. Move speed 5 * delta = move 5 units in 1 second
        const moveDistance = (component.schema.obstacleMoveSpeed * world.time.delta) / 1000

        if (component.dataAttribute.cursor(component.eid).gameActive) {
            for (const element of world.getChildren(component.eid)) {
                const elementStartingPosition = ecs.Position.get(world, element)  // Get current position
                let newX = elementStartingPosition.x - moveDistance
                let yPosition = elementStartingPosition.y
                const zPosition = elementStartingPosition.z
                // Get the new x position along with the current y and z positions
                if (newX < component.schemaAttribute.cursor(component.eid).leftBound) {
                    // Reset position to the back and set a random y position in the upper and lower bounds
                    yPosition = Math.floor(Math.random() * (component.schema.maxHeight -
                        component.schema.minHeight) + component.schema.minHeight)
                    newX -= component.schemaAttribute.cursor(component.eid).leftBound
                }
                // Set its final position for this frame
                world.setPosition(element, newX, yPosition, zPosition)
            }
        }
    },
})

import * as ecs from '@8thwall/ecs';
import { PlayAudio } from './AudioController';

// Game Manager Component
ecs.registerComponent({
    name: 'gameManager',
    schema: {
        level: ecs.i32,
        gameActive: ecs.boolean,
    },
    schemaDefaults: {
        level: 1,
        gameActive: false,
    },
    stateMachine: ({ world, eid, schemaAttribute, dataAttribute }) => {
        const { level } = schemaAttribute.get(eid);

        ecs.defineState('startGame').initial()
            .onEnter(() => {
                dataAttribute.set(eid, 'gameActive', true);
            })
            .onEvent('gameOver', 'gameOverState', { target: world.events.globalId });

        ecs.defineState('gameOverState')
            .onEnter(() => {
                PlayAudio(world, eid, 'gameOver');
                dataAttribute.set(eid, 'gameActive', false);
            });

        ecs.defineState('restartGame')
            .onEvent('restart', 'startGame', { target: world.events.globalId })
            .onEnter(() => {
                dataAttribute.set(eid, 'level', 1);  // Restart the level
                dataAttribute.set(eid, 'gameActive', true);
            });
    },
    tick: (world, component) => {
        const { gameActive } = component.dataAttribute.cursor(component.eid);
        if (!gameActive) {
            return;
        }

        // No need for floor-related collision detection as FloorManager has been removed.
    }
});

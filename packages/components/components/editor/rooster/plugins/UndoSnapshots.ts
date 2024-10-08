import type { Snapshots, UndoSnapshotsService } from 'roosterjs-editor-types';

import { ROOSTER_SNAPSHOTS_MAX_SIZE } from '../../constants';

interface Functions {
    addSnapshot: (snapshots: Snapshots, snapshot: string, isAutoCompleteSnapshot: boolean) => void;
    canMoveCurrentSnapshot: (snapshots: Snapshots, step: number) => boolean;
    moveCurrentSnapshot: (snapshots: Snapshots, step: number) => string | null;
    clearProceedingSnapshots: (snapshots: Snapshots) => void;
    canUndoAutoComplete: (snapshots: Snapshots) => boolean;
    createSnapshots: (maxSize: number) => Snapshots;
}
export default class UndoSnapshots implements UndoSnapshotsService {
    constructor(
        private snapshots: Snapshots,
        private functions: Functions
    ) {}

    public canMove(delta: number): boolean {
        return this.functions.canMoveCurrentSnapshot(this.snapshots, delta);
    }

    public move(delta: number): string {
        const result = this.functions.moveCurrentSnapshot(this.snapshots, delta);
        // @ts-expect-error implemented UndoSnapshotsService typing should be updated in order to accept null
        return result;
    }

    public addSnapshot(snapshot: string, isAutoCompleteSnapshot: boolean) {
        this.functions.addSnapshot(this.snapshots, snapshot, isAutoCompleteSnapshot);
    }

    public clearRedo() {
        this.functions.clearProceedingSnapshots(this.snapshots);
    }

    public canUndoAutoComplete() {
        return this.functions.canUndoAutoComplete(this.snapshots);
    }

    public clearSnapshots() {
        this.snapshots = this.functions.createSnapshots(ROOSTER_SNAPSHOTS_MAX_SIZE);
    }
}

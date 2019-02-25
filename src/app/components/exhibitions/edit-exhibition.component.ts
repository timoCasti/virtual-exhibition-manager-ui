import {Component} from '@angular/core';
import {EditorService} from '../../services/editor/editor.service';
import {Exhibition} from '../../model/implementations/exhibition.model';
import {Room} from '../../model/implementations/room.model';
import {Wall} from '../../model/implementations/wall.model';
import {Exhibit} from '../../model/implementations/exhibit.model';
import {NestedTreeControl} from '@angular/cdk/tree';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MatTreeNestedDataSource} from '@angular/material';

@Component({
    selector: 'app-edit-exhibitions',
    templateUrl: 'edit-exhibition.component.html',
    styleUrls: ['edit-exhibition.component.scss']
})
export class EditExhibitionComponent {

    /** The {NestedTreeControl} for the per-room tree list. */
    private _treeControl = new NestedTreeControl<RoomNode>(node => node.children);

    /** The data source for the per-room tree list. */
    private _roomDataSources: Observable<Map<Room, MatTreeNestedDataSource<RoomNode>>>;

    /** Helper functions to render the tree list. */
    public readonly isFiller = (_: number, node: RoomNode) => !node.payload;
    public readonly isWall = (_: number, node: RoomNode) => !!node.payload && node.payload instanceof Wall;
    public readonly isExhibit = (_: number, node: RoomNode) => !!node.payload && node.payload instanceof Exhibit;

    /**
     * Default constructor.
     *
     * @param _editor Reference to the {EditorService}
     */
    constructor(private _editor: EditorService) {
        this._roomDataSources = this._editor.currentObservable.pipe(
            map( e =>  {
                const rooms = new Map();
                e.rooms.forEach(r => rooms.set(r, this.hierarchy(r)));
                return rooms;
            })
        );
    }

    /**
     * Getter for the @type {Exhibition}.
     */
    get exhibition(): Observable<Exhibition> {
        return this._editor.currentObservable;
    }

    /**
     * Getter for the inspected element.
     */
    get inspected(): Observable<(Exhibition | Room | Wall | Exhibit)> {
        return this._editor.inspectedObservable;
    }

    /**
     * Getter for the per room data source.
     */
    get roomDataSources(): Observable<Map<Room, MatTreeNestedDataSource<RoomNode>>> {
        return this._roomDataSources;
    }

    /**
     * Getter for the tree control.
     */
    get treeControl(): NestedTreeControl<RoomNode> {
        return this._treeControl;
    }

    /**
     * Creates and adds a new {Room} to the current {Exhibition}.
     */
    public addNewRoom() {
        this._editor.current.addRoom(Room.empty())
    }

    /**
     * Deletes the provided {Room} from the current {Exhibition}
     *
     * @param r The {Room} to delete.
     */
    public deleteRoom(r: Room): void {
        this._editor.current.deleteRoom(r);
    }

    /**
     * Hierarchy for displaying the tree list per room.
     *
     * @param r The room for which to return the hierarchy.
     */
    public hierarchy(r: Room): RoomNode[] {
        return [
            {
                name: `Walls (${r.walls.length})`,
                children: r.walls.map(w => {
                    return <RoomNode>{
                        name: `Wall (${r.text}, ${w.direction})`,
                        payload: w,
                        children: w.exhibits.map(e => {
                            return <RoomNode>{
                                name: e.name,
                                payload: e
                            };
                        })
                    };
                })
            },
            {
                name: `3D exhibits (${r.exhibits.length})`,
                children:  r.exhibits.map(e => {
                    return <RoomNode>{name: e.name, payload: e, children: []};
                })
            }
        ];
    }

    /**
     * Returns the name of type of the currently inspected element.
     *
     * @return Type of the inspected element.
     */
    get selectedType(): Observable<string> {
        return this.inspected.pipe(
            map(i => {
                if (i instanceof Exhibit) {
                    return 'Exhibit';
                } else if (i instanceof Exhibition) {
                    return 'Exhibition';
                } else if (i instanceof Room) {
                    return 'Room';
                } else if (i instanceof Wall) {
                    return 'Wall';
                } else {
                    return 'Nothing';
                }
            })
        );
    }

    /**
     *
     */
    get isSelectedExhibition(): Observable<boolean> {
        return this.inspected.pipe(map(e => e  instanceof Exhibition));
    }

    /**
     *
     */
    get isSelectedRoom() {
        return this.inspected.pipe(map(e => e  instanceof Room));
    }

    /**
     *
     */
    get isSelectedWall() {
        return this.inspected.pipe(map(e => e  instanceof Wall));
    }

    /**
     *
     */
    get isSelectedExhibit() {
        return this.inspected.pipe(map(e => e  instanceof Exhibit));
    }

    /**
     * Called whenever a user clicks a {Exhibition}.
     * @param event The mouse event.
     * @param exhibition The {Exhibition} that has been clicked.
     */
    public exhibitionClicked(event: MouseEvent, exhibition: Exhibition) {
        this._editor.inspected = this._editor.current;
        event.stopPropagation();
    }

    /**
     * Called whenever a user clicks a {Exhibit}.
     * @param event The mouse event.
     * @param exhibit The {Exhibit} that has been clicked.
     */
    public exhibitClicked(event: MouseEvent, exhibit: Exhibit) {
        this._editor.inspected = exhibit;
        event.stopPropagation();
    }


    /**
     * Called whenever a user clicks a {Room}.
     * @param event The mouse event.
     * @param room The {Room} that has been clicked.
     */
    public roomClicked(event: MouseEvent, room: Room) {
        this._editor.inspected = room;
        event.stopPropagation();
    }

    /**
     * Called whenever a user clicks a {Wall}.
     * @param event The mouse event.
     * @param wall The {Wall} that has been clicked.
     */
    public wallClicked(event: MouseEvent, wall: Wall) {
        this._editor.inspected = wall;
        event.stopPropagation();
    }
}


/**
 * Food data with nested structure.
 * Each node has a name and an optiona list of children.
 */
interface RoomNode {
    name: string;
    payload?: (Wall | Exhibit);
    children?: RoomNode[];
}

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { fabric } from 'fabric';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import crew_front from './img/crew_front.png';
import { ChromePicker } from 'react-color';
import * as serviceWorker from './serviceWorker';
import './styles/index.css';

let fabricCanvas = new fabric.Canvas();

class Canvas extends Component {
    state = {
        displayColorPicker: false,
        canvasObject: {
            objects: [],
            background: ''
        },
        selectedObject: '',
        objectCanvasColor: '',
        file: '',
        imagePreviewUrl: '',
        color: 'rgb(213, 0, 50)'
    };

    componentDidMount() {
        // we need to get canvas element by ref to initialize fabric
        let el = this.refs.objectsCanvas;
        fabricCanvas.initialize(el, {
            selection: true,
            height: 400,
            width: 200
        });

        // initial call to load objects in store and render canvas
        // this.loadAndRender();

        fabricCanvas.on({
            'mouse:up': () => {
                this.objectCanvasChange();
            },
            'selection:created': (e) => {
                if (e.target.type === 'i-text') {
                    this.setState({ displayColorPicker: true });
                } else {
                    this.setState({ displayColorPicker: false });
                }
            },
            'selection:updated': (e) => {
                if (e.target.type === 'i-text') {
                    this.setState({ displayColorPicker: true });
                } else {
                    this.setState({ displayColorPicker: false });
                }
            },
            'selection:cleared': () => {
                this.setState({ displayColorPicker: false });
            }
        });
    }
    objectCanvasChange = () => {
        this.setState(
            {
                canvasObject: { ...fabricCanvas.toObject() },
                selectedObject: fabricCanvas.getObjects().indexOf(fabricCanvas.getActiveObject())
            },
            () => {
                fabricCanvas.loadFromJSON(this.state.canvasObject);
                fabricCanvas.renderAll();

                // if there is any previously active object, we need to re-set it after rendering canvas
                let selectedObject = this.state.selectedObject;
                if (selectedObject > -1) {
                    fabricCanvas.setActiveObject(fabricCanvas.getObjects()[this.state.selectedObject]);
                }
            }
        );
    };

    objectCanvasAdd = (canvasObject) => {
        this.setState(
            {
                canvasObject: {
                    ...this.state.canvasObject,
                    ...canvasObject
                }
            },
            () => {
                fabricCanvas.loadFromJSON(this.state.canvasObject);

                // if there is any previously active object, we need to re-set it after rendering canvas
                let selectedObject = this.state.selectedObject;
                if (selectedObject > -1) {
                    fabricCanvas.setActiveObject(fabricCanvas.getObjects()[this.state.selectedObject]);
                }
                fabricCanvas.renderAll();
            }
        );
    };

    changeColor = (colorPosition) => {
        if (colorPosition === 0) this.setState({ color: 'rgb(174, 186, 94)' });
        if (colorPosition === 1) this.setState({ color: 'rgb(165, 222, 248)' });
    };

    italicText = () => {
        let activeObject = fabricCanvas.getActiveObject();
        if (activeObject && activeObject.type === 'i-text') {
            activeObject.fontStyle = activeObject.fontStyle == 'italic' ? '' : 'italic';
            this.objectCanvasChange(fabricCanvas);
        }
    };
    boldText = () => {
        let activeObject = fabricCanvas.getActiveObject();
        if (activeObject && activeObject.type === 'i-text') {
            activeObject.fontWeight = activeObject.fontWeight == 'bold' ? '' : 'bold';
            this.objectCanvasChange(fabricCanvas);
        }
    };
    setFont = (font) => {
        let activeObject = fabricCanvas.getActiveObject();
        if (activeObject && activeObject.type === 'i-text') {
            activeObject.fontFamily = font;
            this.objectCanvasChange(fabricCanvas);
        }
    };
    addText = () => {
        let textSample = new fabric.IText('Your text...', {
            left: 100,
            top: 200,
            fontFamily: 'helvetica',
            angle: 0,
            fill: '#000000',
            scaleX: 0.5,
            scaleY: 0.5,
            fontWeight: '',
            hasRotatingPoint: true
        });

        fabricCanvas.add(textSample);

        this.objectCanvasAdd(fabricCanvas.toObject());
    };

    removeText = () => {
        let activeObject = fabricCanvas.getActiveObject();

        fabricCanvas.remove(activeObject);
        this.objectCanvasChange(fabricCanvas);
    };

    handleChangeColor = (color) => {
        let activeObject = fabricCanvas.getActiveObject();

        if (activeObject && activeObject.type === 'i-text') {
            activeObject.fill = color.hex;
        }

        this.setState({ objectCanvasColor: color.hex });
        this.objectCanvasChange(fabricCanvas);
    };

    handleImageChange = (e) => {
        e.preventDefault();
        let reader = new FileReader();
        let file = e.target.files[0];

        reader.onload = (e) => {
            let imgObj = new Image();

            const localImageUrl = window.URL.createObjectURL(file);
            imgObj.src = localImageUrl;

            let image = new fabric.Image(imgObj, {
                left: 100,
                top: 200,
                scaleX: 0.1,
                scaleY: 0.1,
                opacity: 0.7
            });

            fabricCanvas.add(image);

            // JSON.stringify(canvas.toJSON());
            // this.objectCanvasAdd(image);
            this.objectCanvasAdd(fabricCanvas.toObject());
        };

        reader.readAsDataURL(file);
    };

    addRect = () => {
        var rect = new fabric.Rect({
            top: 100,
            left: 100,
            width: 60,
            height: 70,
            fill: 'red'
        });

        this.objectCanvasAdd(rect);
    };

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div style={{ background: this.state.color, width: '530px', height: '630px' }}>
                            <img className="canvas-bg img-fluid" src={crew_front} alt="clothes" />
                            <div className="canvas-bg-wrapper">
                                <canvas
                                    width="200"
                                    height="400"
                                    ref="objectsCanvas"
                                    style={{ border: '1px dashed grey' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <button
                            onClick={() => {
                                this.addText();
                            }}
                        >
                            Add Text
                        </button>
                        <button
                            onClick={() => {
                                this.addRect();
                            }}
                        >
                            Add Rect
                        </button>
                        <button
                            onClick={() => {
                                this.removeText();
                            }}
                        >
                            Remove Text
                        </button>
                        <button
                            onClick={() => {
                                this.italicText();
                            }}
                        >
                            <i>Italic</i>
                        </button>
                        <button
                            onClick={() => {
                                this.boldText();
                            }}
                        >
                            <b>Bold</b>
                        </button>
                        <button
                            href="#"
                            onClick={() => {
                                this.setFont('Arial');
                            }}
                            className="Arial"
                        >
                            Arial
                        </button>
                        <button
                            href="#"
                            onClick={() => {
                                this.setFont('Helvetica');
                            }}
                            className="Helvetica"
                        >
                            Helvetica
                        </button>
                        <button
                            href="#"
                            onClick={() => {
                                this.setFont('Myriad Pro');
                            }}
                            className="MyriadPro"
                        >
                            Myriad Pro
                        </button>
                        <button
                            href="#"
                            onClick={() => {
                                this.setFont('Delicious');
                            }}
                            className="Delicious"
                        >
                            Delicious
                        </button>
                        <button
                            href="#"
                            onClick={() => {
                                this.setFont('Verdana');
                            }}
                            className="Verdana"
                        >
                            Verdana
                        </button>
                        <button
                            href="#"
                            onClick={() => {
                                this.setFont('Georgia');
                            }}
                            className="Georgia"
                        >
                            Georgia
                        </button>
                        <button
                            href="#"
                            onClick={() => {
                                this.setFont('Courier');
                            }}
                            className="Courier"
                        >
                            Courier
                        </button>
                        <button
                            href="#"
                            onClick={() => {
                                this.setFont('Comic Sans MS');
                            }}
                            className="ComicSansMS"
                        >
                            Comic Sans MS
                        </button>
                        <input className="fileInput" type="file" onChange={(e) => this.handleImageChange(e)} />
                    </div>
                    {this.state.displayColorPicker ? (
                        <ChromePicker color={this.state.objectCanvasColor} onChange={this.handleChangeColor} />
                    ) : null}
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Canvas />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

import React, { Component } from 'react';
import './index.css';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

class Square extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <button id={this.props.id} className="block" onClick={() => this.props.updateParent(this.props.move)}>
                {this.props.value}
            </button>
        );
    }
}
class Reset extends Component {
    render() {
        return (
            <button id="reset-button">RESET BOARD</button>
        )
    }
}

class Board extends Component {
    constructor(props) {
        super(props)
        this.state = {
            board: props.board
        }
        this.clickHandler = this.clickHandler.bind(this)
    }
    clickHandler(move) {
        fetch('http://localhost:9080/boards/move', {
            method: 'PUT',
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({
                board: this.state.board._id,
                player: this.props.player._id,
                move: move
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log('status foerte:', data)
                fetch('http://localhost:9080/boards/' + this.props.board._id, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'default',
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status && data.status == 200) {
                            console.log('board foerte:', data)
                            this.setState({
                                board: data.response
                            })
                        }
                    })
            })
    }
    renderSquare(id, value, move) {
        return <Square id={id} value={value} move={move} updateParent={this.clickHandler.bind(this)} />;
    }
    render() {
        console.log('Board in Play Area', this.state.board)
        console.log('Player in Play Area', this.props.player)

        if (this.state.board.finished) {
            if (!this.state.board.winner) {
                if (this.state.board.draw) {
                    MySwal.fire({
                        title: "Draw!",
                        text: "Start another one, probably you'll lose",
                    }).then(() => {
                        this.props.updateParent()
                    })
                }
                MySwal.fire({
                    title: "Loooooseeer!",
                    text: "I got you on this one, keep trying",
                }).then(() => {
                    this.props.updateParent()
                })
            } else if (this.state.board.winner) {
                fetch('http://localhost:9080/players/' + this.state.board.winner, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'default'
                })
                    .then(res => res.json())
                    .then(data => {
                        MySwal.fire({
                            title: `So ${data.response.name}, you won!`,
                            text: "I'll got you the next one",
                        }).then(() => {
                            this.props.updateParent()
                        })
                    })

            }
            return <h2>Finished...</h2>;
        }

        return (
            <div className="container">
                <h1>Tic-Tac-Toe</h1>
                <br></br>
                <div className="play-area">
                    {this.renderSquare("block_0", this.state.board.table_board[0], 0)}
                    {this.renderSquare("block_1", this.state.board.table_board[1], 1)}
                    {this.renderSquare("block_2", this.state.board.table_board[2], 2)}
                    {this.renderSquare("block_3", this.state.board.table_board[3], 3)}
                    {this.renderSquare("block_4", this.state.board.table_board[4], 4)}
                    {this.renderSquare("block_5", this.state.board.table_board[5], 5)}
                    {this.renderSquare("block_6", this.state.board.table_board[6], 6)}
                    {this.renderSquare("block_7", this.state.board.table_board[7], 7)}
                    {this.renderSquare("block_8", this.state.board.table_board[8], 8)}
                </div>
                <br></br>
                <Reset />
            </div>
        )
    }
}

export default class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: 'initial',
            player: {},
            board: {},
        };
        this.reloadComponent = this.reloadComponent.bind(this)
    }

    async getPlayer() {
        let player_default_name = "X"
        return MySwal.fire({
            title: "Welcome to Tic-Tac-Toe!",
            text: "What's your name?",
            input: 'text',
            showCancelButton: true
        }).then(async (result) => {
            let player
            if (result.value) {
                player_default_name = result.value
            }

            player = await fetch('http://localhost:9080/players/' + player_default_name, {
                method: 'POST',
                mode: 'cors',
                cache: 'default'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status && data.status == 201) {
                        return data.response
                    }
                })
            return player
        })
    }

    async getBoard(player) {
        return fetch('http://localhost:9080/boards/' + player._id, {
            method: 'POST',
            mode: 'cors',
            cache: 'default'
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.status == 201) {
                    return data.response
                }
            }).then((board) => {
                if (board) {
                    MySwal.fire({
                        title: "Board Created",
                        text: "Let's play!",
                    })
                }
                return board
            })
    }

    reloadComponent() {
        this.state = {
            loading: 'initial',
            player: {},
            board: {},
        };
        this.newPlayerAndBoard()
    }

    newPlayerAndBoard() {
        this.setState({
            loading: 'true'
        })
        this.getPlayer()
            .then(player => {
                this.setState({
                    player: player
                })
                this.getBoard(player)
                    .then(board => {
                        this.setState({
                            board: board
                        })
                        this.setState({
                            loading: 'false'
                        })
                    })
            })
    }

    componentDidMount() {
        this.newPlayerAndBoard()
    }

    render() {
        if (this.state.loading === 'initial') {
            return <h2>Intializing...</h2>;
        }

        if (this.state.loading === 'true') {
            return <h2>Loading...</h2>;
        }
        return (
            <Board board={this.state.board} player={this.state.player} updateParent={this.reloadComponent.bind(this)} />
        )
    }
}


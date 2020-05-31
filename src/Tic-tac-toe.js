import React, { Component } from 'react';
import './index.css';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

class Square extends Component {
    constructor(props) {
        super(props)
        console.log('las propeanas son:', props)
        this.onClick = this.onClick.bind(this)
    }
    onClick() {
        alert(`clickeado fooooooerte el ${this.props.id}`)
        fetch('http://localhost:9080/boards/move', {
            method: 'PUT',
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({
                board: this.props.board._id,
                player: this.props.player._id,
                move: this.props.move
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
                        console.log('board foerte:', data.response)
                    })
            })
    }
    render() {
        return (
            <button id={this.props.id} className="block" onClick={this.onClick}>
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
    renderSquare(id, value, move) {
        return <Square id={id} value={value} move={move} player={this.props.player} board={this.props.board} />;
    }
    render() {
        console.log('Board in Play Area', this.props.board)
        console.log('Player in Play Area', this.props.player)
        return (
            <div className="container">
                <h1>Tic-Tac-Toe</h1>
                <br></br>
                <div className="play-area">
                    {this.renderSquare("block_0", this.props.board.table_board[0], 0)}
                    {this.renderSquare("block_1", this.props.board.table_board[1], 1)}
                    {this.renderSquare("block_2", this.props.board.table_board[2], 2)}
                    {this.renderSquare("block_3", this.props.board.table_board[3], 3)}
                    {this.renderSquare("block_4", this.props.board.table_board[4], 4)}
                    {this.renderSquare("block_5", this.props.board.table_board[5], 5)}
                    {this.renderSquare("block_6", this.props.board.table_board[6], 6)}
                    {this.renderSquare("block_7", this.props.board.table_board[7], 7)}
                    {this.renderSquare("block_8", this.props.board.table_board[8], 8)}
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

    componentDidMount() {
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

    render() {
        if (this.state.loading === 'initial') {
            return <h2>Intializing...</h2>;
        }

        if (this.state.loading === 'true') {
            return <h2>Loading...</h2>;
        }
        return (
            <Board board={this.state.board} player={this.state.player} />
        )
    }
}


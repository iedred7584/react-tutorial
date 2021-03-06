import React, { MouseEventHandler } from "react";
import ReactDOM from "react-dom";
import "./index.css";

type SquareProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  value: string;
  isHighlight: boolean;
};

function Square(props: SquareProps) {
  return (
    <button
      className={"square" + (props.isHighlight ? " highlight" : "")}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

type BoardProps = {
  squares: string[];
  onClick(i: number): void;
  highlight: number[] | null;
};

class Board extends React.Component<BoardProps> {
  renderSquare(i: number) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isHighlight={this.props.highlight ? this.props.highlight.includes(i) : false}
      />
    );
  }

  render() {
    return (
      <div>
        {[...Array(3)].map((_, i) => (
          <div className="board-row" key={i}>
            {[...Array(3)].map((_, j) => this.renderSquare(i + i * 2 + j))}
          </div>
        ))}
      </div>
    );
  }
}

type GamePropsHistoryPosition = {
  x: number;
  y: number;
};

type GamePropsHistory = {
  squares: string[];
  position: GamePropsHistoryPosition;
  highlight: number[];
};

type GameProps = {
  history: GamePropsHistory[];
  stepNumber: number;
  xIsNext: boolean;
  isAsc: boolean;
};

class Game extends React.Component<{}, GameProps> {
  constructor(props: GameProps) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(""),
          position: {
            x: -1,
            y: -1,
          },
          highlight: [],
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      isAsc: false
    };
  }

  handleClick(i: number): void {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares)[0] || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          position: {
            x: (i % 3) + 1,
            y: Math.floor(i / 3) + 1,
          },
          highlight: [],
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  handleChangeOrderClick(): void {
    this.setState({
      isAsc: !this.state.isAsc
    })
  }

  jumpTo(i: number): void {
    this.setState({
      stepNumber: i,
      xIsNext: i % 2 === 0,
    });
  }

  render() {
    const histories = this.state.history;
    const current = histories[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = histories.map((history: GamePropsHistory, move: number) => {
      const desc = move
        ? `Go to move #${move} (col: ${history.position.x}, row: ${history.position.y})`
        : "Go to game start";
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={this.state.stepNumber === move ? "bold" : ""}
          >
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner[0]) {
      status = "Winner: " + winner[0];
    } else if (!current.squares.includes("")) {
      status = "Draw";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    const order = "ASC <--> DESC";

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i: number) => this.handleClick(i)}
            highlight={winner[1]}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <p><button onClick={() => this.handleChangeOrderClick()}>{order}</button></p>
          <ol>{this.state.isAsc ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares: string[]): [string | null, number[] | null] {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];
    }
  }
  return [null, null];
}

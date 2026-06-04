package player;

public class PlayerScore {
    private int score;
    public PlayerScore(int score) {
        this.score = score;
    }
    public int getScore() {
        return score;
    }
    public void updateScore(int score) {
        this.score = score;
    }

    public boolean equals(PlayerScore other) {
        return this.score == other.score;
    }

    public boolean equals(int other) {
        return this.score == other;
    }
}

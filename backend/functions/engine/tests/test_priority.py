from app.engine.collision import priority_score


def test_priority_score_time_urgency():
    close = priority_score(0.7, 1.0)
    far = priority_score(0.9, 5.0)
    assert close > far

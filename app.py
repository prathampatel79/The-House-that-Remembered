import os
import sys
import sqlite3
import json
import socket
import webbrowser
import threading
import time
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory

# Determine base paths for PyInstaller bundle or local script
if getattr(sys, 'frozen', False):
    # Running in a PyInstaller bundle
    BASE_DIR = sys._MEIPASS
    # Persistent database in LocalAppData so progress is saved across sessions
    local_app_data = os.environ.get('LOCALAPPDATA', os.path.dirname(sys.executable))
    DATA_DIR = os.path.join(local_app_data, 'TheHouseThatRemembered')
    os.makedirs(DATA_DIR, exist_ok=True)
    DB_PATH = os.path.join(DATA_DIR, "game_data.db")
    seed_db = os.path.join(BASE_DIR, "game_data.db")
    if not os.path.exists(DB_PATH) and os.path.exists(seed_db):
        try:
            import shutil
            shutil.copy2(seed_db, DB_PATH)
        except Exception:
            pass
else:
    # Running from source
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_PATH = os.path.join(BASE_DIR, "game_data.db")

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "static"),
    template_folder=os.path.join(BASE_DIR, "templates")
)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS saves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slot_name TEXT UNIQUE,
                player_x REAL DEFAULT 0,
                player_y REAL DEFAULT 1.7,
                player_z REAL DEFAULT 35,
                player_yaw REAL DEFAULT 0,
                player_pitch REAL DEFAULT 0,
                current_floor TEXT DEFAULT 'exterior',
                current_objective TEXT DEFAULT 'Follow the road home.',
                active_mystery INTEGER DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS clues_discovered (
                clue_id TEXT PRIMARY KEY,
                clue_title TEXT,
                floor TEXT,
                mystery_num INTEGER,
                discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS deductions (
                mystery_num INTEGER PRIMARY KEY,
                is_solved INTEGER DEFAULT 0,
                answer_json TEXT,
                solved_at TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory (
                item_id TEXT PRIMARY KEY,
                item_name TEXT,
                item_desc TEXT,
                acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

        cursor.execute("SELECT COUNT(*) FROM inventory WHERE item_id = 'pendant'")
        if cursor.fetchone()[0] == 0:
            cursor.execute('''
                INSERT INTO inventory (item_id, item_name, item_desc)
                VALUES ('pendant', 'Antique Silver Pendant', 'An heirloom engraved with an intricate sun and hourglass symbol. Passed down through your family.')
            ''')
            conn.commit()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/state", methods=["GET"])
def get_state():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM saves WHERE slot_name = 'autosave'")
            save_row = cursor.fetchone()
            save_data = dict(save_row) if save_row else None

            cursor.execute("SELECT * FROM clues_discovered ORDER BY discovered_at ASC")
            clues = [dict(r) for r in cursor.fetchall()]

            cursor.execute("SELECT * FROM deductions ORDER BY mystery_num ASC")
            deductions = [dict(r) for r in cursor.fetchall()]

            cursor.execute("SELECT * FROM inventory ORDER BY acquired_at ASC")
            inventory = [dict(r) for r in cursor.fetchall()]

            return jsonify({
                "status": "success",
                "save": save_data,
                "clues": clues,
                "deductions": deductions,
                "inventory": inventory
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/save", methods=["POST"])
def save_game():
    try:
        data = request.get_json() or {}
        slot_name = data.get("slot_name", "autosave")
        player_pos = data.get("position", {"x": 0, "y": 1.7, "z": 0})
        player_rot = data.get("rotation", {"yaw": 0, "pitch": 0})
        current_floor = data.get("current_floor", "first_floor")
        current_objective = data.get("current_objective", "Investigate the house.")
        active_mystery = data.get("active_mystery", 1)

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO saves (slot_name, player_x, player_y, player_z, player_yaw, player_pitch, current_floor, current_objective, active_mystery, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(slot_name) DO UPDATE SET
                    player_x = excluded.player_x,
                    player_y = excluded.player_y,
                    player_z = excluded.player_z,
                    player_yaw = excluded.player_yaw,
                    player_pitch = excluded.player_pitch,
                    current_floor = excluded.current_floor,
                    current_objective = excluded.current_objective,
                    active_mystery = excluded.active_mystery,
                    updated_at = CURRENT_TIMESTAMP
            ''', (
                slot_name,
                player_pos.get("x", 0),
                player_pos.get("y", 1.7),
                player_pos.get("z", 0),
                player_rot.get("yaw", 0),
                player_rot.get("pitch", 0),
                current_floor,
                current_objective,
                active_mystery
            ))
            conn.commit()

        return jsonify({"status": "success", "message": f"Game saved to {slot_name}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/load", methods=["POST"])
def load_game():
    try:
        data = request.get_json() or {}
        slot_name = data.get("slot_name", "autosave")
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM saves WHERE slot_name = ?", (slot_name,))
            row = cursor.fetchone()
            if not row:
                return jsonify({"status": "error", "message": "Save slot not found"}), 404
            return jsonify({"status": "success", "save": dict(row)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/clue/discover", methods=["POST"])
def discover_clue():
    try:
        data = request.get_json() or {}
        clue_id = data.get("clue_id")
        clue_title = data.get("clue_title", "")
        floor = data.get("floor", "first_floor")
        mystery_num = data.get("mystery_num", 1)

        if not clue_id:
            return jsonify({"status": "error", "message": "Missing clue_id"}), 400

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO clues_discovered (clue_id, clue_title, floor, mystery_num)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(clue_id) DO NOTHING
            ''', (clue_id, clue_title, floor, mystery_num))
            conn.commit()

        return jsonify({"status": "success", "clue_id": clue_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/inventory/add", methods=["POST"])
def add_inventory():
    try:
        data = request.get_json() or {}
        item_id = data.get("item_id")
        item_name = data.get("item_name")
        item_desc = data.get("item_desc", "")

        if not item_id or not item_name:
            return jsonify({"status": "error", "message": "Missing item fields"}), 400

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO inventory (item_id, item_name, item_desc)
                VALUES (?, ?, ?)
                ON CONFLICT(item_id) DO UPDATE SET
                    item_name = excluded.item_name,
                    item_desc = excluded.item_desc
            ''', (item_id, item_name, item_desc))
            conn.commit()

        return jsonify({"status": "success", "item_id": item_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/deduction/solve", methods=["POST"])
def solve_deduction():
    try:
        data = request.get_json() or {}
        mystery_num = int(data.get("mystery_num", 1))
        answer = data.get("answer", {})

        is_correct = False
        revelation_text = ""
        awarded_item = None

        if mystery_num == 1:
            if answer.get("deduction") == "sudden_flight_under_threat":
                is_correct = True
                revelation_text = "The family did not leave under normal circumstances. Important valuables and packed bags were abandoned in haste."
        elif mystery_num == 2:
            order = answer.get("order", [])
            expected = ["receipt", "diary", "audio", "clock"]
            if order == expected:
                is_correct = True
                revelation_text = "Someone else arrived at the house at 11:15 PM, shortly before the grandfather clock was shattered during a confrontation."
        elif mystery_num == 3:
            code = str(answer.get("code", "")).strip()
            if code == "3729":
                is_correct = True
                revelation_text = "The hydraulic seals disengage with a heavy metallic hiss. The hidden investigation room is now open."
        elif mystery_num == 4:
            p = answer.get("person")
            loc = answer.get("location")
            evt = answer.get("event")
            if p == "watcher" and loc == "gate" and evt == "surveillance":
                is_correct = True
                revelation_text = "The family had identified that a syndicate watcher had been monitoring their house for weeks before their disappearance."
        elif mystery_num == 5:
            connection = answer.get("connection")
            if connection == "nisha_heir":
                is_correct = True
                revelation_text = "You are the grandchild of Nisha, Arjun's estranged younger sister. Arjun entrusted the protective pendant to her before she left!"
                awarded_item = {
                    "item_id": "ground_floor_key",
                    "item_name": "Antique Brass Cellar Key",
                    "item_desc": "Heavy brass key engraved with family initials. It unlocks the reinforced ground floor door."
                }
        elif mystery_num == 6:
            who = answer.get("who")
            why_player = answer.get("why_player")
            if who == "watcher" and why_player == "finish_investigation":
                is_correct = True
                revelation_text = "The truth is revealed: Arjun designed this trail of clues knowing only Nisha's heir could piece it together. But who brought you here tonight remains in the shadows..."

        if is_correct:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO deductions (mystery_num, is_solved, answer_json, solved_at)
                    VALUES (?, 1, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(mystery_num) DO UPDATE SET
                        is_solved = 1,
                        answer_json = excluded.answer_json,
                        solved_at = CURRENT_TIMESTAMP
                ''', (mystery_num, json.dumps(answer)))

                if awarded_item:
                    cursor.execute('''
                        INSERT INTO inventory (item_id, item_name, item_desc)
                        VALUES (?, ?, ?)
                        ON CONFLICT(item_id) DO NOTHING
                    ''', (awarded_item["item_id"], awarded_item["item_name"], awarded_item["item_desc"]))
                conn.commit()

            return jsonify({
                "status": "success",
                "correct": True,
                "revelation": revelation_text,
                "awarded_item": awarded_item
            })
        else:
            return jsonify({
                "status": "success",
                "correct": False,
                "message": "The pieces do not fit together logically. Re-examine the collected clues."
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/reset", methods=["POST"])
def reset_game():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM saves")
            cursor.execute("DELETE FROM clues_discovered")
            cursor.execute("DELETE FROM deductions")
            cursor.execute("DELETE FROM inventory WHERE item_id != 'pendant'")
            conn.commit()
        return jsonify({"status": "success", "message": "Game reset successfully."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def find_free_port(start_port=5000):
    for p in range(start_port, start_port + 50):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                if s.connect_ex(('127.0.0.1', p)) != 0:
                    return p
        except Exception:
            pass
    return start_port

def run_flask(port):
    import logging
    logging.getLogger('werkzeug').setLevel(logging.ERROR)
    app.logger.setLevel(logging.ERROR)
    app.run(host="127.0.0.1", port=port, debug=False, threaded=True)

if __name__ == "__main__":
    init_db()
    port = find_free_port(5000)
    url = f"http://127.0.0.1:{port}"

    # Run local offline backend server in background thread
    server_thread = threading.Thread(target=run_flask, args=(port,), daemon=True)
    server_thread.start()

    # Wait for local server socket to be active
    for _ in range(50):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                if s.connect_ex(('127.0.0.1', port)) == 0:
                    break
        except Exception:
            pass
        time.sleep(0.08)

    # Launch native standalone game window (Zero browser dependency)
    try:
        import webview
        webview.settings['ALLOW_FILE_URLS'] = True
        webview.settings['OPEN_EXTERNAL_LINKS_IN_BROWSER'] = False

        window = webview.create_window(
            title="The House That Remembered",
            url=url,
            width=1280,
            height=768,
            min_size=(960, 540),
            resizable=True,
            fullscreen=False,
            confirm_close=False,
            background_color='#050508'
        )
        webview.start()
    except Exception as e:
        print(f"Native desktop window initialization error: {e}")
        try:
            import webbrowser
            webbrowser.open(url)
            server_thread.join()
        except Exception:
            pass

    sys.exit(0)

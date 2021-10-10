/* eslint-disable no-console */
import sqlite from 'react-native-sqlite-2';
let db = sqlite.openDatabase('player.db', '1.0', '', 1);
export default {
    initDB(cb) {
        db.transaction((txn) => {
                let tableQuery = "CREATE TABLE IF NOT EXISTS tracks (id text, title text, url text, img text, favorite text, PRIMARY KEY (id))"
                txn.executeSql(tableQuery, [],
                    function (_tx, _result) {
                            cb({data: true, res: _result});
                    },
                    function (err) {
                        cb({ data: false, err: err });
                    }
                );
        });
    },

    insertRecord(data, cb) {
        db.transaction((txn) => {
                let insertQuery = "INSERT OR REPLACE INTO tracks (id, title, url, img, favorite) VALUES (?,?,?,?,?)"
                txn.executeSql(insertQuery, [data.id, data.title, data.url, data.img, data.favorite],
                    function (_tx, _result) {
                        console.log("insert query success", _result)
                            cb({data: true, res: _result.rows});
                    },
                    function (err) {
                        console.log("insert query failure")
                        cb({ data: false, err: err });
                    }
                );
        });
    },

    getTrack(id, cb) {
        db.transaction((txn) => {
            console.log("get query")
                let query = "SELECT * FROM tracks WHERE id=?"
                txn.executeSql(query, [id],
                    function (tx, result) {
                        // console.log("get query success", result.rows._array)
                            cb({data: result.rows._array});
                    },
                    function (err) {
                        console.log("get query failure")
                        cb({ data: false, err: err });
                    }
                );
        });
    },

}
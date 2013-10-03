'use strict';

var fs = require('../index');
var path = require('path');
var should = require('should');
var h = require('./lib/helpers');

var isWin = !!process.platform.match(/^win/);
var notWin = !isWin;
var tmp = 'tmp';

describe('Moving files', function () {

	function createDummy() {
		var filePath = path.join(tmp, h.rndstr());
		var data = h.rndstr();
		var mode = parseInt('0776', 8);
		fs.createFileSync(filePath, data, mode);
		return {
			path: filePath,
			data: data,
			mode: mode
		};
	}

	describe('.moveFile()', function () {

		it('should move file, preserving its content and mode', function (done) {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr());
			fs.moveFile(dummy.path, newPath, function (err) {
				should.not.exist(err);
				fs.existsSync(dummy.path).should.not.be.ok;
				String(fs.readFileSync(newPath)).should.equal(dummy.data);
				if (notWin) {
					fs.statSync(newPath).mode.should.equal(dummy.mode);
				}
				done();
			});
		});

		it('should create missing destination directories', function (done) {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr(), h.rndstr(), h.rndstr());
			fs.moveFile(dummy.path, newPath, function (err) {
				should.not.exist(err);
				fs.existsSync(dummy.path).should.not.be.ok;
				String(fs.readFileSync(newPath)).should.equal(dummy.data);
				if (notWin) {
					fs.statSync(newPath).mode.should.equal(dummy.mode);
				}
				done();
			});
		});

		it('should move file between partitions/filesystems');

	});

	describe('.moveFileSync()', function () {

		it('should move file, preserving its content and mode', function () {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr());
			fs.moveFileSync(dummy.path, newPath);
			fs.existsSync(dummy.path).should.not.be.ok;
			String(fs.readFileSync(newPath)).should.equal(dummy.data);
			if (notWin) {
				fs.statSync(newPath).mode.should.equal(dummy.mode);
			}
		});

		it('should create missing destination directories', function () {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr(), h.rndstr(), h.rndstr());
			fs.moveFileSync(dummy.path, newPath);
			fs.existsSync(dummy.path).should.not.be.ok;
			String(fs.readFileSync(newPath)).should.equal(dummy.data);
			if (notWin) {
				fs.statSync(newPath).mode.should.equal(dummy.mode);
			}
		});

		it('should move file between partitions/filesystems');

	});

	describe('.move()', function () {

		it('should move a file when path to a file is passed', function (done) {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr());
			fs.move(dummy.path, newPath, function (err) {
				should.not.exist(err);
				fs.existsSync(dummy.path).should.not.be.ok;
				String(fs.readFileSync(newPath)).should.equal(dummy.data);
				if (notWin) {
					fs.statSync(newPath).mode.should.equal(dummy.mode);
				}
				done();
			});
		});

	});

	describe('.moveSync()', function () {

		it('should move a file when path to a file is passed', function () {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr());
			fs.moveSync(dummy.path, newPath);
			fs.existsSync(dummy.path).should.not.be.ok;
			String(fs.readFileSync(newPath)).should.equal(dummy.data);
			if (notWin) {
				fs.statSync(newPath).mode.should.equal(dummy.mode);
			}
		});

	});

});

describe('Moving directories', function () {
	var dirs = [
		'foo',
		'bar',
		'baz',
		path.join('baz', 'foo'),
		path.join('baz', 'bar', 'foo'),
	];
	var files = [
		path.join('bar', h.rndstr()),
		path.join('bar', h.rndstr()),
		path.join('baz', 'bar', h.rndstr()),
		h.rndstr(),
		h.rndstr(),
	];
	var modes = [
		parseInt('0777', 8),
		parseInt('0776', 8),
		parseInt('0767', 8),
		parseInt('0677', 8),
		parseInt('0666', 8),
	];

	function createDummy() {
		var dirPath = path.join(tmp, h.rndstr());
		var map = {};
		dirs.forEach(function (dir) {
			var newPath = path.join(dirPath, dir);
			var mode = modes[Math.floor(Math.random()*modes.length)];
			map[newPath] = {
				mode: mode,
			};
			fs.createDirSync(newPath, mode);
		});
		files.forEach(function (file) {
			var filePath = path.join(dirPath, file);
			var data = h.rndstr();
			var mode = modes[Math.floor(Math.random()*modes.length)];
			map[filePath] = {
				data: data,
				mode: mode,
			};
			fs.createFileSync(filePath, data, mode);
		});
		return {
			path: dirPath,
			map: map
		};
	}

	afterEach(function () {
		fs.emptyDirSync(tmp);
	});

	describe('.moveDir()', function () {

		it('should copy directory and everything in it from one location to another', function (done) {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr());
			fs.moveDir(dummy.path, newPath, function (err) {
				should.not.exist(err);

				// Check directories
				dirs.forEach(function (dir) {
					var oldDirPath = path.join(dummy.path, dir);
					var newDirPath = path.join(newPath, dir);
					var newStat = fs.statSync(newDirPath);
					newStat.isDirectory().should.be.true;
					if (notWin) {
						dummy.map[oldDirPath].mode.should.equal(newStat.mode);
					}
				});

				// Check files
				files.forEach(function (dir) {
					var oldFilePath = path.join(dummy.path, dir);
					var newFilePath = path.join(newPath, dir);
					var newStat = fs.statSync(newFilePath);
					var newData = String(fs.readFileSync(newFilePath));
					newStat.isFile().should.be.true;
					dummy.map[oldFilePath].data.should.equal(newData);
					if (notWin) {
						dummy.map[oldFilePath].mode.should.equal(newStat.mode);
					}
				});

				done();
			});
		});

		it('should create missing parent directories', function (done) {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr(), h.rndstr(), h.rndstr());
			fs.moveDir(dummy.path, newPath, function (err) {
				should.not.exist(err);

				// Check directories
				dirs.forEach(function (dir) {
					var oldDirPath = path.join(dummy.path, dir);
					var newDirPath = path.join(newPath, dir);
					var newStat = fs.statSync(newDirPath);
					newStat.isDirectory().should.be.true;
					if (notWin) {
						dummy.map[oldDirPath].mode.should.equal(newStat.mode);
					}
				});

				// Check files
				files.forEach(function (dir) {
					var oldFilePath = path.join(dummy.path, dir);
					var newFilePath = path.join(newPath, dir);
					var newStat = fs.statSync(newFilePath);
					var newData = String(fs.readFileSync(newFilePath));
					newStat.isFile().should.be.true;
					dummy.map[oldFilePath].data.should.equal(newData);
					if (notWin) {
						dummy.map[oldFilePath].mode.should.equal(newStat.mode);
					}
				});

				done();
			});
		});

		it('should move directory between partitions/filesystems');

	});

	describe('.moveDirSync()', function () {

		it('should copy directory and everything in it from one location to another', function () {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr());
			fs.moveDirSync(dummy.path, newPath);

			// Check directories
			dirs.forEach(function (dir) {
				var oldDirPath = path.join(dummy.path, dir);
				var newDirPath = path.join(newPath, dir);
				var newStat = fs.statSync(newDirPath);
				newStat.isDirectory().should.be.true;
				if (notWin) {
					dummy.map[oldDirPath].mode.should.equal(newStat.mode);
				}
			});

			// Check files
			files.forEach(function (dir) {
				var oldFilePath = path.join(dummy.path, dir);
				var newFilePath = path.join(newPath, dir);
				var newStat = fs.statSync(newFilePath);
				var newData = String(fs.readFileSync(newFilePath));
				newStat.isFile().should.be.true;
				dummy.map[oldFilePath].data.should.equal(newData);
				if (notWin) {
					dummy.map[oldFilePath].mode.should.equal(newStat.mode);
				}
			});
		});

		it('should create missing parent directories', function () {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr(), h.rndstr(), h.rndstr());
			fs.moveDirSync(dummy.path, newPath);

			// Check directories
			dirs.forEach(function (dir) {
				var oldDirPath = path.join(dummy.path, dir);
				var newDirPath = path.join(newPath, dir);
				var newStat = fs.statSync(newDirPath);
				newStat.isDirectory().should.be.true;
				if (notWin) {
					dummy.map[oldDirPath].mode.should.equal(newStat.mode);
				}
			});

			// Check files
			files.forEach(function (dir) {
				var oldFilePath = path.join(dummy.path, dir);
				var newFilePath = path.join(newPath, dir);
				var newStat = fs.statSync(newFilePath);
				var newData = String(fs.readFileSync(newFilePath));
				newStat.isFile().should.be.true;
				dummy.map[oldFilePath].data.should.equal(newData);
				if (notWin) {
					dummy.map[oldFilePath].mode.should.equal(newStat.mode);
				}
			});
		});

		it('should move directory between partitions/filesystems');

	});

	describe('.move()', function () {

		it('should move a directory when path to a directory is passed', function (done) {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr());
			fs.move(dummy.path, newPath, function (err) {
				should.not.exist(err);

				// Check directories
				dirs.forEach(function (dir) {
					var oldDirPath = path.join(dummy.path, dir);
					var newDirPath = path.join(newPath, dir);
					var newStat = fs.statSync(newDirPath);
					newStat.isDirectory().should.be.true;
					if (notWin) {
						dummy.map[oldDirPath].mode.should.equal(newStat.mode);
					}
				});

				// Check files
				files.forEach(function (dir) {
					var oldFilePath = path.join(dummy.path, dir);
					var newFilePath = path.join(newPath, dir);
					var newStat = fs.statSync(newFilePath);
					var newData = String(fs.readFileSync(newFilePath));
					newStat.isFile().should.be.true;
					dummy.map[oldFilePath].data.should.equal(newData);
					if (notWin) {
						dummy.map[oldFilePath].mode.should.equal(newStat.mode);
					}
				});

				done();
			});
		});

	});

	describe('.moveSync()', function () {

		it('should move a directory when path to a directory is passed', function () {
			var dummy = createDummy();
			var newPath = path.join(tmp, h.rndstr());
			fs.moveSync(dummy.path, newPath);

			// Check directories
			dirs.forEach(function (dir) {
				var oldDirPath = path.join(dummy.path, dir);
				var newDirPath = path.join(newPath, dir);
				var newStat = fs.statSync(newDirPath);
				newStat.isDirectory().should.be.true;
				if (notWin) {
					dummy.map[oldDirPath].mode.should.equal(newStat.mode);
				}
			});

			// Check files
			files.forEach(function (dir) {
				var oldFilePath = path.join(dummy.path, dir);
				var newFilePath = path.join(newPath, dir);
				var newStat = fs.statSync(newFilePath);
				var newData = String(fs.readFileSync(newFilePath));
				newStat.isFile().should.be.true;
				dummy.map[oldFilePath].data.should.equal(newData);
				if (notWin) {
					dummy.map[oldFilePath].mode.should.equal(newStat.mode);
				}
			});
		});

	});

});
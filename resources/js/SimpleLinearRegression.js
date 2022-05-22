class SimpleLinearRegression {
	constructor(data) {
		this._data = data;

		this._sumX = 0;
		this._sumY = 0;
		this._sumSquareXY = 0;
		this._sumSquareX = 0;

		for (let i = 0; i < this._data.length; ++i) {
			this._sumX += this._data[i][0];
			this._sumY += this._data[i][1];

			this._sumSquareXY += this._data[i][0] * this._data[i][1];
			this._sumSquareX += Math.pow(this._data[i][0], 2);
		}
	}

	getAverageX() {
		return this._sumX / this._data.length;
	}

	getAverageY() {
		return this._sumY / this._data.length;
	}

	getCovarianceXY() {
		return this._sumSquareXY / this._data.length - this.getAverageX() * this.getAverageY();
	}

	getVarianceX() {
		return this._sumSquareX / this._data.length - Math.pow(this.getAverageX(), 2);
	}

	getSlope() {
		return this.getCovarianceXY() / this.getVarianceX();
	}

	getInterceptY() {
		return this.getAverageY() - this.getSlope() * this.getAverageX();
	}

	getY(x) {
		return this.getSlope() * x + this.getInterceptY();
	}
}

export default SimpleLinearRegression;

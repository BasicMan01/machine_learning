class SimpleLinearRegression {
	constructor(data) {
		this.data = data;

		this.sumX = 0;
		this.sumY = 0;
		this.sumSquareXY = 0;
		this.sumSquareX = 0;

		for (let i = 0; i < this.data.length; ++i) {
			this.sumX += this.data[i][0];
			this.sumY += this.data[i][1];

			this.sumSquareXY += this.data[i][0] * this.data[i][1];
			this.sumSquareX += Math.pow(this.data[i][0], 2);
		}
	}

	getAverageX() {
		return this.sumX / this.data.length;
	}

	getAverageY() {
		return this.sumY / this.data.length;
	}

	getCovarianceXY() {
		return this.sumSquareXY / this.data.length - this.getAverageX() * this.getAverageY();
	}

	getVarianceX() {
		return this.sumSquareX / this.data.length - Math.pow(this.getAverageX(), 2);
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
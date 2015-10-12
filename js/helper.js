angular.module('helper', [])
    .service('helperService', function () {

        var fixReports = function (reports) {
            // Report must be an array...
            if (!angular.isArray(reports))
                reports = [reports];

            angular.forEach(reports, function (report) {
                var hasPart = [];

                // learningOpportunitySpecification must be an array
                if (!angular.isArray(report.learningOpportunitySpecification))
                    hasPart.push({learningOpportunitySpecification: report.learningOpportunitySpecification})
                else
                    angular.forEach(report.learningOpportunitySpecification, function (specification) {
                        hasPart.push({learningOpportunitySpecification: specification});
                    });
                report.learningOpportunitySpecification = hasPart;
            });
            return reports;
        };
        return {fixReports : fixReports};

    });

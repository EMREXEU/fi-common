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

        var selectedLanguage = "fi";

        function getRightLanguage(titles) {
            var result = "";
            angular.forEach(titles, function (title) {
                if (title['xml:lang'] === selectedLanguage)
                    result = title['content'];
            });
            return result;
        };

        var calculateCourses = function (learningOpportunityArray, count) {
            var count = 0;
            angular.forEach(learningOpportunityArray, function (opportunity) {
                if (opportunity.learningOpportunitySpecification) {
                    count++;
                    if (opportunity.learningOpportunitySpecification.hasPart)
                        count = count + calculateCourses(opportunity.learningOpportunitySpecification.hasPart)
                }
            });
            return count;
        };

        var filterProperReports = function(reports) {
         return reports.filter(function (report) {
                var goodReport = true;
                angular.forEach(report.learningOpportunitySpecification, function (object) {
                    if (!object.learningOpportunitySpecification)
                        goodReport = false;
                });
                return goodReport;
            });
        }

        return {fixReports : fixReports,
                getRightLanguage : getRightLanguage,
                calculateCourses : calculateCourses,
                filterProperReports : filterProperReports};

    });

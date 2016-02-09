angular.module('learningReport', [])
    .directive('learningReportDirective', function (selectedCoursesService, helperService) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                report: '=',
                typeFilter: '=',
                levelFilter: '=',
                onlyViewing: '=',
                onlyViewing: '=',
                startDate: '=',
                endDate: '='
            },
            templateUrl: 'fi-common/partials/learningReport.html',
            controller: function ($scope) {

                $scope.selectAll = true;

                $scope.selectAllClicked = function () {
                    angular.forEach($scope.flattenedLearningOpportunities, function (opportunity) {
                        opportunity.selected = $scope.selectAll;
                        $scope.checkBoxChanged(opportunity);
                    });
                }

                if (!angular.isArray($scope.report.learningOpportunitySpecification))
                    $scope.report.learningOpportunitySpecification = [{learningOpportunitySpecification: $scope.report.learningOpportunitySpecification}];

                $scope.getRightLanguage = helperService.getRightLanguage;

                function unselectInvisibleOpportunity(visible, opportunity) {
                    if (!visible) {
                        opportunity.selected = false;
                        $scope.checkBoxChanged(opportunity);
                    }
                }

                $scope.selectedTypes = function (opportunity) {
                    var visible = ($scope.onlyViewing) || $scope.typeFilter[opportunity.type];
                    unselectInvisibleOpportunity(visible, opportunity);
                    return visible;
                };

                $scope.selectedLevel = function (opportunity) {
                    var visible = ($scope.onlyViewing || $scope.levelFilter == "Any") || $scope.levelFilter == opportunity.specifies.learningOpportunityInstance.credit.level;
                    unselectInvisibleOpportunity(visible, opportunity);
                    return visible;
                };

                $scope.selectedTimeInterval = function (opportunity) {
                    if (!opportunity.specifies.learningOpportunityInstance.date)
                        return true;

                    var date = Date.parse(opportunity.specifies.learningOpportunityInstance.date);
                    var startDate;
                    var endDate;
                    if ($scope.startDate)
                        startDate = Date.parse($scope.startDate);

                    if ($scope.endDate)
                        endDate = Date.parse($scope.endDate);


                    var visible = ($scope.onlyViewing ||
                    (!endDate || endDate >= date)
                    && (!startDate || startDate <= date));
                    unselectInvisibleOpportunity(visible, opportunity);
                    return visible;
                };


                function recursiveOpportunityFlattening(learningOpportunityArray, partOf) {
                    angular.forEach(learningOpportunityArray, function (opportunityWrapper) {

                        if (opportunityWrapper) {

                            // in some cases learningopportunityspecification is an array. some cases not..
                            if (opportunityWrapper.learningOpportunitySpecification)
                                var opportunity = opportunityWrapper.learningOpportunitySpecification;
                            else
                                var opportunity = opportunityWrapper;


                            // Add Elmo identifier
                            if (angular.isArray(opportunity.identifier))
                                angular.forEach(opportunity.identifier, function (identifier) {
                                    if (identifier.type == "elmo")
                                        opportunity.elmoIdentifier = identifier.content;
                                    if (identifier.type == "local" || identifier.type == "oodi" ) //TODO remove oodi
                                        opportunity.localIdentifier = identifier.content;
                                })
                            else if (opportunity.identifier) {
                                opportunity.elmoIdentifier = opportunity.identifier.content;
                                opportunity.localIdentifier = opportunity.identifier.content;
                            }
                            // Find parents Elmo identifier
                            if (partOf && partOf.elmoIdentifier)
                                opportunity.partOf = partOf.elmoIdentifier
                            else
                                opportunity.partOf = '-';

                            flatArray.push(opportunity);

                            // Add properties for table
                            if (opportunity.selected === undefined) {
                                opportunity.selected = true;
                                selectedCoursesService.addId(opportunity.elmoIdentifier); // all are selected at the beginning
                            }
                            // Recursion
                            if (opportunity.hasPart)
                                recursiveOpportunityFlattening(opportunity.hasPart, opportunity)
                        }
                    });
                    return flatArray;
                }
                ;

                var flatArray = [];
                flatArray = recursiveOpportunityFlattening($scope.report.learningOpportunitySpecification);
                $scope.flattenedLearningOpportunities = flatArray;

                $scope.issuerName = helperService.getRightLanguage($scope.report.issuer.title);

                var selectParent = function (child) {
                    if (child.partOf != '-')
                        angular.forEach($scope.flattenedLearningOpportunities, function (possibleParent) {
                            if (possibleParent.elmoIdentifier == child.partOf) {
                                possibleParent.selected = true;
                                $scope.checkBoxChanged(possibleParent);
                            }
                        });
                };

                var deselectChilds = function (parent) {
                    angular.forEach($scope.flattenedLearningOpportunities, function (possibleChild) {
                        if (parent.elmoIdentifier == possibleChild.partOf) {
                            possibleChild.selected = false;
                            $scope.checkBoxChanged(possibleChild);
                        }
                    })
                }


                $scope.checkBoxChanged = function (opportunity) {
                    if (opportunity.selected) {
                        selectedCoursesService.addId(opportunity.elmoIdentifier)
                        selectParent(opportunity);

                    }
                    else {
                        selectedCoursesService.removeId(opportunity.elmoIdentifier);
                        deselectChilds(opportunity);
                    }
                }
            }
        }
    });
